pragma solidity ^0.6.11;

// Log messages to console with `console.log("Message", "Other Message")` like JS
import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BrightIdFaucet {
     using SafeMath for uint256;

    uint256 public constant ONE_HUNDRED_PERCENT = 1e18;

    bytes32 public context;
    ERC20 public token;
    uint256 public periodLength;
    uint256 public percentPerPeriod;
    uint256 public firstPeriodStart;
    mapping (address => Claimer) public claimers;
    mapping (uint256 => uint256) public periodsRegisteredUserCounts;

    struct Claimer {
        uint256 registeredForPeriod;
        uint256 latestClaimPeriod;
    }

    constructor(ERC20 _token, uint256 _periodLength, uint256 _percentPerPeriod, bytes32 _context) public {
        token = _token;
        periodLength = _periodLength;
        percentPerPeriod = _percentPerPeriod;
        context = _context;
        firstPeriodStart = now;
    }

    function register() public {
        // TODO: check brightId node valid signature
        uint256 nextPeriod = getCurrentPeriod() + 1;
        claimers[msg.sender].registeredForPeriod = nextPeriod;
        periodsRegisteredUserCounts[nextPeriod]++;
    }

    function claim() public {
        Claimer storage claimer = claimers[msg.sender];
        uint256 currentPeriod = getCurrentPeriod();

        if (_canClaim(claimer, currentPeriod)) {
            token.transfer(msg.sender, getPeriodPayout(currentPeriod));
            claimer.latestClaimPeriod = currentPeriod;
        }

        register();
    }

    function getCurrentPeriod() public view returns (uint256) {
        return (now - firstPeriodStart) / periodLength;
    }

    function getPeriodPayout(uint256 _periodNumber) public view returns (uint256) {
        uint256 periodRegisteredUserCount = periodsRegisteredUserCounts[_periodNumber];
        uint256 tokenBalance = token.balanceOf(address(this));

        uint256 totalAvailable = tokenBalance.mul(percentPerPeriod).div(ONE_HUNDRED_PERCENT);

        return totalAvailable.div(periodRegisteredUserCount);
    }

    function _canClaim(Claimer storage claimer, uint256 currentPeriod) internal view returns (bool) {
        bool userRegisteredCurrentPeriod = currentPeriod > 0 && claimer.registeredForPeriod == currentPeriod;
        bool userClaimedCurrentPeriod = claimer.latestClaimPeriod >= currentPeriod;

        return userRegisteredCurrentPeriod && !userClaimedCurrentPeriod;  /** && unique according to BrightID (isUniqueHuman call) */
    }
}
