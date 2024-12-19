// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContractERC20 is ERC20, ERC20Burnable, Ownable {
    // Token metadata
    string private _tokenImage;
    
    // Social media links
    struct SocialMedia {
        string twitter;
        string facebook;
        string telegram;
    }
    
    SocialMedia private _socialMedia;
    
    // Events
    event TokenImageUpdated(string newImage);
    event SocialMediaUpdated(string twitter, string facebook, string telegram);

    constructor(
        string memory name,
        string memory symbol,
        string memory tokenImage,
        string memory twitter,
        string memory facebook,
        string memory telegram,
        uint256 initialSupply,
        address addressOwner
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _tokenImage = tokenImage;
        _socialMedia = SocialMedia(twitter, facebook, telegram);
        _mint(addressOwner, initialSupply*10**decimals());
    }

    // Image management
    function setTokenImage(string memory newImage) public onlyOwner {
        _tokenImage = newImage;
        emit TokenImageUpdated(newImage);
    }

    function getTokenImage() public view returns (string memory) {
        return _tokenImage;
    }

    // Social media management
    function setSocialMedia(
        string memory twitter,
        string memory facebook,
        string memory telegram
    ) public onlyOwner {
        _socialMedia = SocialMedia(twitter, facebook, telegram);
        emit SocialMediaUpdated(twitter, facebook, telegram);
    }

    function getSocialMedia() public view returns (
        string memory twitter,
        string memory facebook,
        string memory telegram
    ) {
        return (
            _socialMedia.twitter,
            _socialMedia.facebook,
            _socialMedia.telegram
        );
    }
} 