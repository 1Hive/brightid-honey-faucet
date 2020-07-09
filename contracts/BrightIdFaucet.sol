pragma solidity ^0.6.11;

// Log messages to console with `console.log("Message", "Other Message")` like JS
import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BrightIdFaucet is Ownable {
     using SafeMath for uint256;

    string private constant ERROR_INCORRECT_VERIFICATION = "INCORRECT_VERIFICATION";
    string private constant ERROR_SENDER_NOT_VERIFIED = "SENDER_NOT_VERIFIED";

    uint256 public constant ONE_HUNDRED_PERCENT = 1e18;

    struct Claimer {
        uint256 registeredForPeriod;
        uint256 latestClaimPeriod;
    }

    struct Period {
        uint256 registeredUsersCount;
        uint256 claimsCount;
        uint256 balance;
    }

    ERC20 public token;
    uint256 public periodLength;
    uint256 public percentPerPeriod;
    bytes32 public brightIdContext;
    address public brightIdVerifier;
    uint256 public firstPeriodStart;
    mapping (address => Claimer) public claimers;
    mapping (uint256 => Period) public periods;

    event SetToken(address token);
    event SetPeriodSettings(uint256 periodLength, uint256 percentPerPeriod);
    event SetBrightIdSettings(bytes32 brightIdContext, address brightIdVerifier);
    event Claim(address claimer, uint256 periodNumber, uint256 amount);
    event Register(address sender, uint256 periodNumber);

    constructor(ERC20 _token, uint256 _periodLength, uint256 _percentPerPeriod, bytes32 _brightIdContext, address _brightIdVerifier) public {
        token = _token;
        periodLength = _periodLength;
        percentPerPeriod = _percentPerPeriod;
        brightIdContext = _brightIdContext;
        brightIdVerifier = _brightIdVerifier;
        firstPeriodStart = now;
    }

    function setToken(ERC20 _token) public onlyOwner {
        token = _token;
        emit SetToken(address(_token));
    }

    function setPeriodSettings(uint256 _periodLength, uint256 _percentPerPeriod) public onlyOwner {
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
    function claimAndOrRegister(bytes32 _brightIdContext, address[] memory _addrs, uint8 _v, bytes32 _r, bytes32 _s) public {
        require(_isVerifiedUnique(_brightIdContext, _addrs, _v, _r, _s), ERROR_INCORRECT_VERIFICATION);
        require(msg.sender == _addrs[0], ERROR_SENDER_NOT_VERIFIED);

        claim();

        uint256 nextPeriod = getCurrentPeriod() + 1;
        claimers[msg.sender].registeredForPeriod = nextPeriod;
        periods[nextPeriod].registeredUsersCount++;

        emit Register(msg.sender, nextPeriod);
    }

    // If for some reason you cannot register again, lost uniqueness or brightID nodes down, you can still claim for
    // the previous period if eligible with this function.
    function claim() public {
        Claimer storage claimer = claimers[msg.sender];
        uint256 currentPeriod = getCurrentPeriod();

        if (_canClaim(claimer, currentPeriod)) {
            Period storage period = periods[currentPeriod];

            // Save balance so every claimer gets the same payout amount.
            if (period.claimsCount == 0) {
                period.balance = token.balanceOf(address(this));
            }

            uint256 amount = getPeriodPayout(currentPeriod);
            token.transfer(msg.sender, amount);

            claimer.latestClaimPeriod = currentPeriod;
            period.claimsCount++;

            emit Claim(msg.sender, currentPeriod, amount);
        }
    }

    function getCurrentPeriod() public view returns (uint256) {
        return (now - firstPeriodStart) / periodLength;
    }

    function getPeriodPayout(uint256 _periodNumber) public view returns (uint256) {
        Period memory period = periods[_periodNumber];
        uint256 periodBalance = period.claimsCount == 0 ? token.balanceOf(address(this)) : period.balance;
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
}
