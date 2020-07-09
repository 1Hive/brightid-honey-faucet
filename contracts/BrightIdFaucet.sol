pragma solidity ^0.6.11;

// Log messages to console with `console.log("Message", "Other Message")` like JS
import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BrightIdFaucet {
     using SafeMath for uint256;

    uint256 public constant ONE_HUNDRED_PERCENT = 1e18;

    ERC20 public token;
    uint256 public periodLength;
    uint256 public percentPerPeriod;
    bytes32 public brightIdContext;
    address public brightIdVerifier;
    uint256 public firstPeriodStart;
    mapping (address => Claimer) public claimers;
    mapping (uint256 => uint256) public periodsRegisteredUserCounts;

    struct Claimer {
        uint256 registeredForPeriod;
        uint256 latestClaimPeriod;
    }

    // TODO: Add setters for these things, not sure the best way, since we're not an AragonApp...
    constructor(ERC20 _token, uint256 _periodLength, uint256 _percentPerPeriod, bytes32 _brightIdContext, address _brightIdVerifier) public {
        token = _token;
        periodLength = _periodLength;
        percentPerPeriod = _percentPerPeriod;
        brightIdContext = _brightIdContext;
        brightIdVerifier = _brightIdVerifier;
        firstPeriodStart = now;
    }

    // If you have previously registered then you will claim here and register for the next period.
    function claimAndOrRegister(bytes32 _brightIdContext, address[] memory _addrs, uint8 _v, bytes32 _r, bytes32 _s) public {
        require(_isVerifiedUnique(_brightIdContext, _addrs, _v, _r, _s), "Incorrect verification");
        require(msg.sender == _addrs[0], "Sender not verified account");

        claim();

        uint256 nextPeriod = getCurrentPeriod() + 1;
        claimers[msg.sender].registeredForPeriod = nextPeriod;
        periodsRegisteredUserCounts[nextPeriod]++;
    }

    // If for some reason you cannot register again, lost uniqueness or brightID nodes down, you can still claim for
    // the previous period if eligible with this function.
    function claim() public {
        Claimer storage claimer = claimers[msg.sender];
        uint256 currentPeriod = getCurrentPeriod();

        if (_canClaim(claimer, currentPeriod)) {
            token.transfer(msg.sender, getPeriodPayout(currentPeriod));
            claimer.latestClaimPeriod = currentPeriod;
        }
    }

    function getCurrentPeriod() public view returns (uint256) {
        return (now - firstPeriodStart) / periodLength;
    }

    // TODO: Store the tokenBalance used in this calculation if its the first call in a period
    //      Then use that value for subsequent calculations within the same period. This way every claimer in a period
    //      receives the same amount and there isn't a rush to claim at the start of a period.
    function getPeriodPayout(uint256 _periodNumber) public view returns (uint256) {

        uint256 periodRegisteredUserCount = periodsRegisteredUserCounts[_periodNumber];
        uint256 tokenBalance = token.balanceOf(address(this));

        uint256 totalAvailable = tokenBalance.mul(percentPerPeriod).div(ONE_HUNDRED_PERCENT);

        return totalAvailable.div(periodRegisteredUserCount);
    }

    function _canClaim(Claimer storage claimer, uint256 currentPeriod) internal view returns (bool) {
        bool userRegisteredCurrentPeriod = currentPeriod > 0 && claimer.registeredForPeriod == currentPeriod;
        bool userYetToClaimCurrentPeriod = claimer.latestClaimPeriod < currentPeriod;

        return userRegisteredCurrentPeriod && userYetToClaimCurrentPeriod;  /** && unique according to BrightID (isUniqueHuman call) */
    }

    // TODO: This should also accept a timestamp but the nodes do not currently provide one, once they do we can add it.
    function _isVerifiedUnique(bytes32 _brightIdContext, address[] memory _addrs, uint8 _v, bytes32 _r, bytes32 _s)
        internal view returns (bool)
    {
        bytes32 signedMessage = keccak256(abi.encodePacked(_brightIdContext, _addrs));
        address verifierAddress = ecrecover(signedMessage, _v, _r, _s);
        bool correctVerifier = brightIdVerifier == verifierAddress;
        bool correctContext = brightIdContext == _brightIdContext;
//        bool correctTimestamp = timestamp = now +/- 1 day // Within a day of now to account for block wait times? Can think of alternative?

        return correctVerifier && correctContext; // && correctTimestamp;
    }
}
