// SPDX-License-Identifier: MIT

pragma solidity >=0.4.21 <0.7.0;
//pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ERC721Token.sol";

contract SupplyChain is ERC721Token, AccessControl {
    using Address for address;

    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant TRANSPORT_ROLE = keccak256("TRANSPORT_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    address public admin;

    struct Battery {
        uint256 id;
        string manufacturer;
        bytes6 serialno;
        int16 thermal;
        bytes26 location;
        address requestingDistributor;
    }

    mapping(uint256 => Battery) private batteries;
    uint256 private nextId;

    constructor(string memory _tokenURIBase) public ERC721Token(_tokenURIBase) {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin");
        _;
    }

    modifier onlyManufacturer() {
        require(
            super.hasRole(MANUFACTURER_ROLE, msg.sender),
            "Caller is not a Manufacturer"
        );
        _;
    }

    modifier onlyTransporter() {
        require(
            super.hasRole(TRANSPORT_ROLE, msg.sender),
            "Caller is not a Transporter"
        );
        _;
    }

    modifier onlyDistributor() {
        require(
            super.hasRole(DISTRIBUTOR_ROLE, msg.sender),
            "Caller is not a Distributor"
        );
        _;
    }

    modifier onlyRequestingDistributor(uint256 _id) {
        require(
            batteries[_id].requestingDistributor == msg.sender,
            "Caller is not the Requesting Distributor"
        );
        _;
    }

    modifier onlyOwner(uint256 _id) {
        require(super.ownerOf(_id) == msg.sender, "Caller is not a the Owner");
        _;
    }

    function addManufacturer(address manufacturer) public onlyAdmin() {
        super._setupRole(MANUFACTURER_ROLE, manufacturer);
    }

    function addTransporter(address transporter) public onlyAdmin() {
        super._setupRole(TRANSPORT_ROLE, transporter);
    }

    function addDistributor(address distributor) public onlyAdmin() {
        super._setupRole(DISTRIBUTOR_ROLE, distributor);
    }

    function makeBattery(
        string memory _manufacturer,
        bytes6 _serialno,
        int16 _thermal,
        bytes26 _location
    ) public onlyManufacturer() {
        super._mint(msg.sender, nextId);
        batteries[nextId] = Battery(
            nextId,
            _manufacturer,
            _serialno,
            _thermal,
            _location,
            address(0)
        );
        nextId++;
    }

    function orderBattery(uint256 _id) public onlyDistributor() {
        batteries[_id].requestingDistributor = msg.sender;
    }

    function thermalMonitor(
        uint256 _id,
        int16 _thermal,
        bytes26 _location
    ) public onlyTransporter() onlyOwner(_id) {
        batteries[_id].thermal = _thermal;
        batteries[_id].location = _location;
    }

    function transferBattery(
        uint256 _id,
        address _to,
        int16 _thermal,
        bytes26 _location
    ) public onlyOwner(_id) {
        batteries[_id].thermal = _thermal;
        batteries[_id].location = _location;
        super._transfer(msg.sender, _to, _id);
    }

    function getBatteryTrackingInfo(uint256 _id)
        public
        view
        onlyRequestingDistributor(_id)
        returns (
            int16,
            bytes26,
            address
        )
    {
        return (
            batteries[_id].thermal,
            batteries[_id].location,
            super.ownerOf(_id)
        );
    }
}
