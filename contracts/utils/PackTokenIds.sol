// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

abstract contract PackTokenIds {
    mapping(uint256 => uint256) private _DataStore;

    function usedTokenId(uint256 tokenId)
        public
        view
        returns (bool freeMintUsed, bool preSaleUsed)
    {
        (uint256 boolRow, uint256 boolColumn) = freeMintPosition(tokenId);
        uint256 packedBools = _DataStore[boolRow];
        freeMintUsed = (packedBools & (uint256(1) << boolColumn)) > 0
            ? true
            : false;
        preSaleUsed = (packedBools & (uint256(1) << (boolColumn + 1))) > 0
            ? true
            : false;
    }

    function freeMintPosition(uint256 tokenId)
        internal
        pure
        returns (uint256 boolRow, uint256 boolColumn)
    {
        boolRow = (tokenId << 1) / 256;
        boolColumn = (tokenId << 1) % 256;
    }

        // Utilities
    function packBool(
        uint256 _packedBools,
        uint256 _boolIndex,
        bool _value
    ) public pure returns (uint256) {
        return
            _value
                ? _packedBools | (uint256(1) << _boolIndex)
                : _packedBools & ~(uint256(1) << _boolIndex);
    }

    function unPackBool(uint256 _packedBools, uint256 _boolIndex)
        internal
        pure
        returns (bool)
    {
        return (_packedBools >> _boolIndex) & uint256(1) == 1 ? true : false;
    }

    function preSalePosition(uint256 tokenId)
        internal
        pure
        returns (uint256 boolRow, uint256 boolColumn)
    {
        (boolRow, boolColumn) = freeMintPosition(tokenId);
        boolColumn++;
    }



     function setUsedTokenIds(
        uint256[] calldata freeMints,
        uint256[] calldata preSales
    ) public {
        uint256 cRow;
        uint256 cPackedBools = _DataStore[0];

        for (uint256 i; i < freeMints.length; i++) {
            (uint256 boolRow, uint256 boolColumn) = freeMintPosition(
                freeMints[i]
            );

            if (boolRow != cRow) {
                _DataStore[cRow] = cPackedBools;
                cRow = boolRow;
                cPackedBools = _DataStore[boolRow];
            }

            cPackedBools = packBool(cPackedBools, boolColumn, true);

            if (i + 1 == freeMints.length) {
                _DataStore[cRow] = cPackedBools;
            }
        }

        for (uint256 i; i < preSales.length; i++) {
            (uint256 boolRow, uint256 boolColumn) = preSalePosition(
                preSales[i]
            );

            if (boolRow != cRow) {
                _DataStore[cRow] = cPackedBools;
                cRow = boolRow;
                cPackedBools = _DataStore[boolRow];
            }

            cPackedBools = packBool(cPackedBools, boolColumn, true);

            if (i + 1 == preSales.length) {
                _DataStore[cRow] = cPackedBools;
            }
        }
    }

}
