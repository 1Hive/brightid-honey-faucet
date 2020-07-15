pragma solidity ^0.6.11;

abstract contract UniswapExchange {

    function tokenToEthTransferOutput(uint256 eth_bought, uint256 max_tokens, uint256 deadline, address recipient)
        virtual external returns (uint256  tokens_sold);
}