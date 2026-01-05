// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract ContribNFT is ERC721URIStorage, AccessControl, EIP712 {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    string private constant SIGNING_DOMAIN = "ContribMint";
    string private constant SIGNATURE_VERSION = "1";

    // Counter for token IDs
    uint256 private _nextTokenId;

    // Mapping to check if a PR (unique identifier) has already been minted
    // Format: keccak256(abi.encodePacked(projectId, prId)) => boolean
    mapping(bytes32 => bool) public hasBeenMinted;

    event ContribMinted(address indexed to, uint256 indexed tokenId, string projectId, string prId);

    constructor(address defaultAdmin) 
        ERC721("ContribMint", "CNTRB") 
        EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) 
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
    }

    struct Voucher {
        string projectId;
        string prId;
        string metadataUri;
        address minter;
    }

    /// @notice Mints an NFT using a server-side signature (Lazy Minting)
    /// @param voucher The voucher containing mint details
    /// @param signature The signature provided by the MINTER_ROLE account
    function redeem(Voucher calldata voucher, bytes calldata signature) external {
        address signer = _verify(voucher, signature);
        require(hasRole(MINTER_ROLE, signer), "Invalid signature or unauthorized signer");
        require(voucher.minter == msg.sender, "Voucher not for this user");

        bytes32 uniquePrHash = keccak256(abi.encodePacked(voucher.projectId, voucher.prId));
        require(!hasBeenMinted[uniquePrHash], "Contribution already minted");

        hasBeenMinted[uniquePrHash] = true;
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(voucher.minter, tokenId);
        _setTokenURI(tokenId, voucher.metadataUri);

        emit ContribMinted(voucher.minter, tokenId, voucher.projectId, voucher.prId);
    }

    function _verify(Voucher calldata voucher, bytes calldata signature) internal view returns (address) {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("Voucher(string projectId,string prId,string metadataUri,address minter)"),
            keccak256(bytes(voucher.projectId)),
            keccak256(bytes(voucher.prId)),
            keccak256(bytes(voucher.metadataUri)),
            voucher.minter
        )));
        return ECDSA.recover(digest, signature);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
