pragma solidity ^0.6.11;

// Log messages to console with `console.log("Message", "Other Message")` like JS
import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BrightIdFaucet {

    uint256 public constant ONE_HUNDRED_PERCENT = 1e18;

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

    constructor(ERC20 _token, uint256 _periodLength, uint256 _percentPerPeriod) public {
        token = _token;
        periodLength = _periodLength;
        percentPerPeriod = _percentPerPeriod;
        firstPeriodStart = now;
    }

    function register() public {
        claimers[msg.sender].registeredForPeriod = getCurrentPeriod() + 1;
    }

    function claim() public {
        Claimer storage claimer = claimers[msg.sender];
        uint256 currentPeriod = getCurrentPeriod();
        if (claimer.registeredForPeriod == currentPeriod && claimer.latestClaimPeriod < currentPeriod /** && unique according to BrightID */) {
            token.transfer(msg.sender, getPeriodPayout(getCurrentPeriod()));
        }
        claimer.registeredForPeriod = getCurrentPeriod() + 1;
        // Update periodsRegisteredUserCounts
    }

    function getCurrentPeriod() public view returns (uint256) {
        return (now - firstPeriodStart) / periodLength;
    }

    function getPeriodPayout(uint256 _periodNumber) public view returns (uint256) {
        // Use periodsRegisteredUserCounts, this contracts balance of the token
        // and percentPerPeriod to determine the payout
        return 0;
    }
}
