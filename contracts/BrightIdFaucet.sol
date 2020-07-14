pragma solidity ^0.6.11;

// Log messages to console with `console.log("Message", "Other Message")` like JS
import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/UniswapExchange.sol";

contract BrightIdFaucet is Ownable {
     using SafeMath for uint256;

    string private constant ERROR_ADDRESS_VOIDED = "ADDRESS_VOIDED";
    string private constant ERROR_FAUCET_BALANCE_IS_ZERO = "FAUCET_BALANCE_IS_ZERO";
    string private constant ERROR_INCORRECT_VERIFICATION = "INCORRECT_VERIFICATION";
    string private constant ERROR_INVALID_PERIOD_LENGTH = "INVALID_PERIOD_LENGTH";
    string private constant ERROR_INVALID_PERIOD_PERCENTAGE = "INVALID_PERIOD_PERCENTAGE";
    string private constant ERROR_SENDER_NOT_VERIFIED = "SENDER_NOT_VERIFIED";

    uint256 public constant ONE_HUNDRED_PERCENT = 1e18;

    struct Claimer {
        uint256 registeredForPeriod;
        uint256 latestClaimPeriod;
        bool addressVoid;
    }

    struct Period {
        uint256 registeredUsersCount;
        uint256 balance;
    }

    ERC20 public token;
    uint256 minimumEthBalance;  // If claimers have less than this minimum at the moment of claiming tokens,
                                // a portion of them will be sold in exchange for ETH/xDAI in order to satisfy the minimum requirement.
    UniswapExchange uniswapExchange;
    uint256 public periodLength;
    uint256 public percentPerPeriod;
    bytes32 public brightIdContext;
    address public brightIdVerifier;
    uint256 public firstPeriodStart;
    mapping (address => Claimer) public claimers;
    mapping (uint256 => Period) public periods;

    event SetPeriodSettings(uint256 periodLength, uint256 percentPerPeriod);
    event SetBrightIdSettings(bytes32 brightIdContext, address brightIdVerifier);
    event SetMinimumEthBalance(uint256 miniumBalance);
    event Claim(address claimer, uint256 periodNumber, uint256 amount);
    event Register(address sender, uint256 periodNumber);

    constructor(
        ERC20 _token,
        uint256 _periodLength,
        uint256 _percentPerPeriod,
        bytes32 _brightIdContext,
        address _brightIdVerifier,
        UniswapExchange _uniswapExchange,
        uint256 _minimumEthBalance
    )
        public
    {
        require(_periodLength > 0, ERROR_INVALID_PERIOD_LENGTH);
        require(_percentPerPeriod < ONE_HUNDRED_PERCENT, ERROR_INVALID_PERIOD_PERCENTAGE);

        token = _token;
        periodLength = _periodLength;
        percentPerPeriod = _percentPerPeriod;
        brightIdContext = _brightIdContext;
        brightIdVerifier = _brightIdVerifier;
        firstPeriodStart = now;

        uniswapExchange = _uniswapExchange;
        minimumEthBalance = _minimumEthBalance;
    }

    function setMinimumEthBalance(uint256 _minimumEthBalance) public onlyOwner {
        minimumEthBalance = _minimumEthBalance;

        emit SetMinimumEthBalance(_minimumEthBalance);
    }

    function setPeriodSettings(uint256 _periodLength, uint256 _percentPerPeriod) public onlyOwner {
        require(_periodLength > 0, ERROR_INVALID_PERIOD_LENGTH);
        require(_percentPerPeriod < ONE_HUNDRED_PERCENT, ERROR_INVALID_PERIOD_PERCENTAGE);

        periodLength = _periodLength;
        percentPerPeriod = _percentPerPeriod;
        emit SetPeriodSettings(_periodLength, _percentPerPeriod);
    }

    function setBrightIdSettings(bytes32 _brightIdContext, address _brightIdVerifier) public onlyOwner {
        brightIdContext = _brightIdContext;
        brightIdVerifier = _brightIdVerifier;
        emit SetBrightIdSettings(_brightIdContext, _brightIdVerifier);
    }
 
    // If you have previously registered then you will claim here and register for the next period.
    function claimAndOrRegister(bytes32 _brightIdContext, address[] memory _addrs, uint8 _v, bytes32 _r, bytes32 _s, uint256 _transferWindow) public {
        require(_isVerifiedUnique(_brightIdContext, _addrs, _v, _r, _s), ERROR_INCORRECT_VERIFICATION);
        require(msg.sender == _addrs[0], ERROR_SENDER_NOT_VERIFIED);

        claim(_transferWindow);

        uint256 nextPeriod = getCurrentPeriod() + 1;
        claimers[msg.sender].registeredForPeriod = nextPeriod;
        periods[nextPeriod].registeredUsersCount++;
        _voidUserHistory(_addrs);

        emit Register(msg.sender, nextPeriod);
    }

    // If for some reason you cannot register again, lost uniqueness or brightID nodes down, you can still claim for
    // the previous period if eligible with this function.
    function claim(uint256 _transferWindow) public {
        Claimer storage claimer = claimers[msg.sender];
        require(!claimer.addressVoid, ERROR_ADDRESS_VOIDED);

        uint256 currentPeriod = getCurrentPeriod();

        if (_canClaim(claimer, currentPeriod)) {
            Period storage period = periods[currentPeriod];

            // Save balance so every claimer gets the same payout amount.
            if (period.balance == 0) {
                uint256 faucetBalance = token.balanceOf(address(this));
                require(faucetBalance > 0, ERROR_FAUCET_BALANCE_IS_ZERO);
                period.balance = faucetBalance;
            }

            uint256 claimerPayout = getPeriodPayout(currentPeriod);
            uint256 tokensSold = 0;

            if (msg.sender.balance < minimumEthBalance) {
                tokensSold = _topUpSenderEthBalance(msg.sender, claimerPayout, _transferWindow);
            }

            uint256 totalPayout = claimerPayout.sub(tokensSold);
            token.transfer(msg.sender, totalPayout);

            claimer.latestClaimPeriod = currentPeriod;

            emit Claim(msg.sender, currentPeriod, totalPayout);
        }
    }

    function getCurrentPeriod() public view returns (uint256) {
        return (now - firstPeriodStart) / periodLength;
    }

    function getPeriodPayout(uint256 _periodNumber) public view returns (uint256) {
        Period storage period = periods[_periodNumber];
        uint256 periodBalance = period.balance == 0 ? token.balanceOf(address(this)) : period.balance;
        uint256 periodRegisteredUsersCount = period.registeredUsersCount;

        uint256 totalAvailable = periodBalance.mul(percentPerPeriod).div(ONE_HUNDRED_PERCENT);

        return totalAvailable.div(periodRegisteredUsersCount);
    }

    function _canClaim(Claimer storage claimer, uint256 currentPeriod) internal view returns (bool) {
        bool userRegisteredCurrentPeriod = currentPeriod > 0 && claimer.registeredForPeriod == currentPeriod;
        bool userYetToClaimCurrentPeriod = claimer.latestClaimPeriod < currentPeriod;

        return userRegisteredCurrentPeriod && userYetToClaimCurrentPeriod;
    }

    // TODO: This should also accept a timestamp but the nodes do not currently provide one, once they do we can add it.
    function _isVerifiedUnique(bytes32 _brightIdContext, address[] memory _addrs, uint8 _v, bytes32 _r, bytes32 _s)
        internal view returns (bool)
    {
        bytes32 signedMessage = keccak256(abi.encodePacked(_brightIdContext, _addrs));
        address verifierAddress = ecrecover(signedMessage, _v, _r, _s);

        bool correctVerifier = brightIdVerifier == verifierAddress;
        bool correctContext = brightIdContext == _brightIdContext;
        // bool correctTimestamp = timestamp = now +/- 1 day // Within a day of now to account for block wait times? Can think of alternative?

        return correctVerifier && correctContext; // && correctTimestamp;
    }

    function _voidUserHistory(address[] memory _addrs) internal {
        if (_addrs.length <= 1) {
            return;
        }

        // Void all previously used addresses to prevent users
        // from registering with old addresses after they registered with their newest verified address.
        uint256 index = 1;
        while (!claimers[_addrs[index]].addressVoid) {
            claimers[_addrs[index]].addressVoid = true;

            index++;
        }
    }

    function _topUpSenderEthBalance(address _sender, uint256 _maxAmount, uint256 _transferWindow) private returns (uint256 tokensSold){
        uint256 exchangeAllowance = token.allowance(address(this), address(uniswapExchange));
        if (exchangeAllowance < _maxAmount) {
            // Some ERC20 tokens fail if allowance is not 0 when approving tokens
            if (exchangeAllowance > 0) {
                token.approve(address(uniswapExchange), 0);
            }

            token.approve(address(uniswapExchange), _maxAmount);
        }

        uint256 amountToBuy = minimumEthBalance.sub(_sender.balance);
        tokensSold = uniswapExchange.tokenToEthTransferOutput(amountToBuy, _maxAmount, now.add(_transferWindow), _sender);
    }
}
