pragma solidity ^0.6.11;

abstract contract UniswapExchange {

    function tokenToEthTransferOutput(uint256 eth_bought, uint256 max_tokens, uint256 deadline, address recipient)
        external virtual returns (uint256 tokens_sold);

    function tokenToEthTransferInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline, address recipient)
        external virtual returns (uint256 eth_bought);

    function getTokenToEthOutputPrice(uint256 eth_bought) public virtual view returns (uint256);
}