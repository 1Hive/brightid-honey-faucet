pragma solidity ^0.6.11;

import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/UniswapExchange.sol";
import "./lib/TimeHelpers.sol";

contract BrightIdFaucet is TimeHelpers, Ownable {
     using SafeMath for uint256;

    string private constant ERROR_INVALID_PERIOD_LENGTH = "INVALID_PERIOD_LENGTH";
    string private constant ERROR_INVALID_PERIOD_PERCENTAGE = "INVALID_PERIOD_PERCENTAGE";
    string private constant ERROR_ALREADY_REGISTERED = "ALREADY_REGISTERED";
    string private constant ERROR_INCORRECT_VERIFICATION = "INCORRECT_VERIFICATION";
    string private constant ERROR_SENDER_NOT_IN_VERIFICATION = "SENDER_NOT_IN_VERIFICATION";
    string private constant ERROR_ADDRESS_VOIDED = "ADDRESS_VOIDED";
    string private constant ERROR_CANNOT_CLAIM = "CANNOT_CLAIM";
    string private constant ERROR_FAUCET_BALANCE_IS_ZERO = "FAUCET_BALANCE_IS_ZERO";

    uint256 public constant ONE_HUNDRED_PERCENT = 1e18;
    uint256 public constant UNISWAP_DEADLINE_PERIOD = 1 days;
    uint256 public constant VERIFICATION_TIMESTAMP_VARIANCE = 1 days;

    struct Claimer {
        uint256 registeredForPeriod;
        uint256 latestClaimPeriod;
        bool addressVoid;
    }

    struct Period {
        uint256 totalRegisteredUsers;
        uint256 maxPayout;
    }

    ERC20 public token;
    uint256 public periodLength;
    uint256 public percentPerPeriod;
    bytes32 public brightIdContext;
    address public brightIdVerifier;
    uint256 public minimumEthBalance; // Claim will top up the claimers eth balance to this level by selling some tokens
    UniswapExchange public uniswapExchange;
    uint256 public firstPeriodStart;
    mapping (address => Claimer) public claimers;
    mapping (uint256 => Period) public periods;

    event Initialize(
        address token,
        uint256 periodLength,
        uint256 percentPerPeriod,
        bytes32 brightIdContext,
        address brightIdVerifier,
        uint256 minimumEthBalance,
        address uniswapExchange
    );
    event SetPercentPerPeriod(uint256 percentPerPeriod);
    event SetBrightIdSettings(bytes32 brightIdContext, address brightIdVerifier);
    event SetMinimumEthBalance(uint256 miniumBalance);
    event SetUniswapExchange(UniswapExchange uniswapExchange);
    event Claim(address claimer, uint256 periodNumber, uint256 payoutMinusSold, uint256 claimerPayout);
    event Register(address sender, uint256 periodNumber);

    /**
    * @param _token Token distributed by the faucet
    * @param _periodLength Length of each distribution period
    * @param _percentPerPeriod Percent of total balance distributed each period
    * @param _brightIdContext BrightId context used for verifying users
    * @param _brightIdVerifier BrightId verifier address that signs BrightId verifications
    * @param _minimumEthBalance Claim will top up a users balance to this amount when claiming if it is less
    * @param _uniswapExchange Uniswap exchange for converting faucet tokens to ETH during claiming if necessary
    */
    constructor(
        ERC20 _token,
        uint256 _periodLength,
        uint256 _percentPerPeriod,
        bytes32 _brightIdContext,
        address _brightIdVerifier,
        uint256 _minimumEthBalance,
        UniswapExchange _uniswapExchange
    )
        public
    {
        require(_periodLength > 0, ERROR_INVALID_PERIOD_LENGTH);
        require(_percentPerPeriod <= ONE_HUNDRED_PERCENT, ERROR_INVALID_PERIOD_PERCENTAGE);

        token = _token;
        periodLength = _periodLength;
        percentPerPeriod = _percentPerPeriod;
        brightIdContext = _brightIdContext;
        brightIdVerifier = _brightIdVerifier;
        minimumEthBalance = _minimumEthBalance;
        uniswapExchange = _uniswapExchange;
        firstPeriodStart = getTimestamp();

        emit Initialize(
            address(_token),
            _periodLength,
            _percentPerPeriod,
            _brightIdContext,
            _brightIdVerifier,
            _minimumEthBalance,
            address(_uniswapExchange)
        );
    }

    /**
    * @notice Set percent per period
    * @param _percentPerPeriod Percent of total balance distributed each period
    */
    function setPercentPerPeriod(uint256 _percentPerPeriod) public onlyOwner {
        require(_percentPerPeriod <= ONE_HUNDRED_PERCENT, ERROR_INVALID_PERIOD_PERCENTAGE);

        percentPerPeriod = _percentPerPeriod;
        emit SetPercentPerPeriod(_percentPerPeriod);
    }

    /**
    * @notice Set BrightId settings
    * @param _brightIdContext BrightId context used for verifying users
    * @param _brightIdVerifier BrightId verifier address that signs BrightId verifications
    */
    function setBrightIdSettings(bytes32 _brightIdContext, address _brightIdVerifier) public onlyOwner {
        brightIdContext = _brightIdContext;
        brightIdVerifier = _brightIdVerifier;
        emit SetBrightIdSettings(_brightIdContext, _brightIdVerifier);
    }

    /**
    * @notice Set the minimum eth balance
    * @param _minimumEthBalance Claim will top up a users balance to this amount when claiming if it is less
    */
    function setMinimumEthBalance(uint256 _minimumEthBalance) public onlyOwner {
        minimumEthBalance = _minimumEthBalance;
        emit SetMinimumEthBalance(_minimumEthBalance);
    }

    /**
    * @notice Set the Uniswap exchange address
    * @param _uniswapExchange Uniswap exchange for converting faucet tokens to ETH during claiming if necessary
    */
    function setUniswapExchange(UniswapExchange _uniswapExchange) public onlyOwner {
        uniswapExchange = _uniswapExchange;
        emit SetUniswapExchange(_uniswapExchange);
    }

    /**
    * @notice Register for the next period and claim if registered for the current period.
    * @param _brightIdContext The context used in the users verification
    * @param _addrs The history of addresses, or contextIds, used by this user to register with BrightID for the BrightId context
    * @param _timestamp The time the verification was created by a BrightId node
    * @param _v Part of the BrightId nodes signature verifying the users uniqueness
    * @param _r Part of the BrightId nodes signature verifying the users uniqueness
    * @param _s Part of the BrightId nodes signature verifying the users uniqueness
    */
    function claimAndOrRegister(
        bytes32 _brightIdContext,
        address[] memory _addrs,
        uint256 _timestamp,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    )
        public
    {
        Claimer storage claimer = claimers[msg.sender];
        require(claimer.registeredForPeriod <= getCurrentPeriod(), ERROR_ALREADY_REGISTERED);
        require(_isVerifiedUnique(_brightIdContext, _addrs, _timestamp, _v, _r, _s), ERROR_INCORRECT_VERIFICATION);
        require(msg.sender == _addrs[0], ERROR_SENDER_NOT_IN_VERIFICATION);
        require(!claimer.addressVoid, ERROR_ADDRESS_VOIDED);

        uint256 currentPeriod = getCurrentPeriod();
        if (_canClaim(claimer, currentPeriod)) {
            _claim(claimer, currentPeriod);
        }

        uint256 nextPeriod = getCurrentPeriod() + 1;
        claimer.registeredForPeriod = nextPeriod;
        periods[nextPeriod].totalRegisteredUsers++;
        _voidUserHistory(_addrs);

        emit Register(msg.sender, nextPeriod);
    }

    /**
    * @notice Claim from the faucet without registering for the next period. Can be used when the user is no longer
    *         verified or the brightID node providing verifications is down.
    */
    function claim() public {
        Claimer storage claimer = claimers[msg.sender];
        uint256 currentPeriod = getCurrentPeriod();
        require(!claimer.addressVoid, ERROR_ADDRESS_VOIDED);
        require(_canClaim(claimer, currentPeriod), ERROR_CANNOT_CLAIM);

        _claim(claimer, currentPeriod);
    }

    /**
    * @notice Withdraw the faucets entire balance of the faucet distributed token
    * @param _to Address to withdraw to
    */
    function withdrawDeposit(address _to) public onlyOwner {
        token.transfer(_to, token.balanceOf(address(this)));
    }

    /**
    * @notice Get the current period number
    */
    function getCurrentPeriod() public view returns (uint256) {
        return (getTimestamp() - firstPeriodStart) / periodLength;
    }

    /**
    * @notice Get a specific periods individual payouts. For future and uninitialised periods with 0 registered
    *         users it will return 0
    * @param _periodNumber Period number
    */
    function getPeriodIndividualPayout(uint256 _periodNumber) public view returns (uint256) {
        Period storage period = periods[_periodNumber];
        return _getPeriodIndividualPayout(period);
    }

    function _isVerifiedUnique(
        bytes32 _brightIdContext,
        address[] memory _addrs,
        uint256 _timestamp,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    )
        internal view returns (bool)
    {
        bytes32 signedMessage = keccak256(abi.encodePacked(_brightIdContext, _addrs, _timestamp));
        address verifierAddress = ecrecover(signedMessage, _v, _r, _s);

        bool correctVerifier = brightIdVerifier == verifierAddress;
        bool correctContext = brightIdContext == _brightIdContext;
        bool acceptableTimestamp = getTimestamp() < _timestamp.add(VERIFICATION_TIMESTAMP_VARIANCE);

        return correctVerifier && correctContext && acceptableTimestamp;
    }

    function _voidUserHistory(address[] memory _addrs) internal {
        if (_addrs.length <= 1) {
            return;
        }

        // Void all previously used addresses to prevent users from registering multiple times using old BrightID verifications.
        uint256 index = 1;
        while (index < _addrs.length && !claimers[_addrs[index]].addressVoid) {
            claimers[_addrs[index]].addressVoid = true;
            index++;
        }
    }

    function _canClaim(Claimer storage claimer, uint256 currentPeriod) internal view returns (bool) {
        bool userRegisteredCurrentPeriod = claimer.registeredForPeriod == currentPeriod;
        bool userYetToClaimCurrentPeriod = claimer.latestClaimPeriod < currentPeriod;

        return userRegisteredCurrentPeriod && userYetToClaimCurrentPeriod;
    }

    function _claim(Claimer storage _claimer, uint256 _currentPeriod) internal {
        Period storage period = periods[_currentPeriod];
        uint256 faucetBalance = token.balanceOf(address(this));
        require(faucetBalance > 0, ERROR_FAUCET_BALANCE_IS_ZERO);

        // Save maxPayout so every claimer gets the same payout amount.
        if (period.maxPayout == 0) {
            period.maxPayout = _getPeriodMaxPayout(faucetBalance);
        }

        uint256 claimerPayout = _getPeriodIndividualPayout(period);
        uint256 tokensSoldForEth = 0;

        if (msg.sender.balance < minimumEthBalance) {
            tokensSoldForEth = _topUpSenderEthBalance(msg.sender, claimerPayout);
        }

        uint256 payoutMinusSold = claimerPayout.sub(tokensSoldForEth);
        token.transfer(msg.sender, payoutMinusSold);

        _claimer.latestClaimPeriod = _currentPeriod;

        emit Claim(msg.sender, _currentPeriod, payoutMinusSold, claimerPayout);
    }

    function _topUpSenderEthBalance(address _sender, uint256 _maxTokensToSpend) private returns (uint256 tokensSold) {
        uint256 exchangeAllowance = token.allowance(address(this), address(uniswapExchange));
        if (exchangeAllowance < _maxTokensToSpend) {
            // Some ERC20 tokens fail if allowance is not 0 before calling approve
            if (exchangeAllowance > 0) {
                token.approve(address(uniswapExchange), 0);
            }

            token.approve(address(uniswapExchange), _maxTokensToSpend);
        }

        uint256 amountToBuy = minimumEthBalance.sub(_sender.balance);
        uint256 tokenPriceForTopUp = uniswapExchange.getTokenToEthOutputPrice(amountToBuy);
        uint256 uniswapTransactionDeadline = getTimestamp() + UNISWAP_DEADLINE_PERIOD;
        
        if (_maxTokensToSpend <= tokenPriceForTopUp) {
            uniswapExchange.tokenToEthTransferInput(_maxTokensToSpend, 1, uniswapTransactionDeadline, _sender);
            return _maxTokensToSpend;
        } else {
            return uniswapExchange
                .tokenToEthTransferOutput(amountToBuy, _maxTokensToSpend, uniswapTransactionDeadline, _sender);
        }
    }

    function _getPeriodMaxPayout(uint256 _faucetBalance) internal view returns (uint256) {
        return _faucetBalance.mul(percentPerPeriod).div(ONE_HUNDRED_PERCENT);
    }

    function _getPeriodIndividualPayout(Period storage period) internal view returns (uint256) {
        if (period.totalRegisteredUsers == 0) {
            return 0;
        }

        uint256 periodMaxPayout = period.maxPayout == 0 ?
        _getPeriodMaxPayout(token.balanceOf(address(this))) : period.maxPayout;

        return periodMaxPayout.div(period.totalRegisteredUsers);
    }
}
