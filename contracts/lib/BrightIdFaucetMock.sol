pragma solidity ^0.6.11;

import "../BrightIdFaucet.sol";

contract BrightIdFaucetMock is BrightIdFaucet {

    using SafeMath for uint256;

    uint256 mockedTimestamp;
    uint256 mockedBlockNumber;

    constructor(
        ERC20 _token,
        uint256 _periodLength,
        uint256 _percentPerPeriod,
        bytes32 _brightIdContext,
        address _brightIdVerifier,
        uint256 _minimumEthBalance,
        UniswapExchange _uniswapExchange
    ) public BrightIdFaucet(
        _token,
        _periodLength,
        _percentPerPeriod,
        _brightIdContext,
        _brightIdVerifier,
        _minimumEthBalance,
        _uniswapExchange
    ) {}

    /**
    * @dev Sets a mocked timestamp value, used only for testing purposes
    */
    function mockSetTimestamp(uint256 _timestamp) public {
        mockedTimestamp = _timestamp;
    }

    /**
    * @dev Increases the mocked timestamp value, used only for testing purposes
    */
    function mockIncreaseTime(uint256 _seconds) public {
        if (mockedTimestamp != 0) mockedTimestamp = mockedTimestamp.add(_seconds);
        else mockedTimestamp = block.timestamp.add(_seconds);
    }

    /**
    * @dev Decreases the mocked timestamp value, used only for testing purposes
    */
    function mockDecreaseTime(uint256 _seconds) public {
        if (mockedTimestamp != 0) mockedTimestamp = mockedTimestamp.sub(_seconds);
        else mockedTimestamp = block.timestamp.sub(_seconds);
    }

    /**
    * @dev Advances the mocked block number value, used only for testing purposes
    */
    function mockAdvanceBlocks(uint256 _number) public {
        if (mockedBlockNumber != 0) mockedBlockNumber = mockedBlockNumber.add(_number);
        else mockedBlockNumber = block.number.add(_number);
    }

    /**
    * @dev Returns the mocked timestamp value
    */
    function getTimestampPublic() public view returns (uint64) {
        return getTimestamp64();
    }

    /**
    * @dev Returns the mocked block number value
    */
    function getBlockNumberPublic() public view returns (uint256) {
        return getBlockNumber();
    }

    /**
    * @dev Returns the mocked timestamp if it was set, or current `block.timestamp`
    */
    function getTimestamp() internal override view returns (uint256) {
        if (mockedTimestamp != 0) return mockedTimestamp;
        return super.getTimestamp();
    }

    /**
    * @dev Returns the mocked block number if it was set, or current `block.number`
    */
    function getBlockNumber() internal override view returns (uint256) {
        if (mockedBlockNumber != 0) return mockedBlockNumber;
        return super.getBlockNumber();
    }

}
