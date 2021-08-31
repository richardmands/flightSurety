// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;

    struct Airline {
        address owner;
        bool registered;
        string name;
        bool funded;
        uint8 votes;
        uint8 requiredVotes;
    }

    struct Insuree {
        address user;
        uint256 amount;
    }

    struct Flight {
        string flight;
        bool registered;
        bool insured;
        Insuree[] insurees;
        uint8 statusCode;
        bool statusChecked;
    }
   
    mapping (address => mapping(string => bool)) private registrationVotes;
    mapping (string => Flight) private registeredFlights;
    mapping(address => uint) credits;
    mapping(address => mapping(string => uint)) insurees;
    mapping (string => Airline) private airlines;
    string[] private airlineNames;
    mapping(address => bool) airlineOwners;
    uint8 public airlineOwnersCount = 0;
    uint8 public registeredAirlinesCount = 0;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event Received(uint256 amount);
    event CreditPaid(address user, uint credit);
    event Voted(address user, bool vote);

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner(address owner)
    {
        require(owner == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }

    function getBalance() public view requireIsOperational returns(uint256){
        return address(this).balance;
    }

    function getAirlineOwnersCount() public view returns(uint8){
        return airlineOwnersCount;
    }

    function getRegisteredAirlinesCount() public view requireIsOperational returns(uint8){
        return registeredAirlinesCount;
    }

    function getAirlinesList() external view requireIsOperational returns(string[] memory){
        return airlineNames;
    }
    
    function getAirlineDetails(string memory airline) external view requireIsOperational returns(Airline memory){
        return airlines[airline];
    }

    function checkHasVoted(string memory airline, address user) external view requireIsOperational returns (bool) {
        return registrationVotes[user][airline];
    }

    function checkIsFundedOwner(address owner) external view returns (bool){
        return airlineOwners[owner];
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode,
                                address owner
                            ) 
                            external
    {   require(this.checkIsFundedOwner(owner), "Not a funded owner!");
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   

    function updateAirline
                            (
                                string memory airline,
                                Airline memory airlineDetails,
                                address user,
                                bool voted
                            )
                            external
                            requireIsOperational
    {
        if(voted){
            registrationVotes[user][airline] = true;
            emit Voted(user, registrationVotes[user][airline]);
        }

        if(airlines[airline].owner == address(0)){
            airlineNames.push(airline);
        }

        if(airlines[airline].registered == false && airlineDetails.registered){
            registeredAirlinesCount += 1;
        }

        airlines[airline] = airlineDetails;
    }

    function registerFlight (string memory flight) external requireIsOperational {
        registeredFlights[flight].flight = flight;
        registeredFlights[flight].registered = true;
        registeredFlights[flight].insured = false;
        registeredFlights[flight].statusCode = 10;
    }
    
    function getRegisteredFlight (string memory flight) external view requireIsOperational returns (Flight memory){
        return registeredFlights[flight];
    }

    function updateFlightStatus(string memory flight, uint8 statusCode) public requireIsOperational {
        require(registeredFlights[flight].statusCode != 20, "Can't update if already designated as Late Airline");
        registeredFlights[flight].statusCode = statusCode;
        registeredFlights[flight].statusChecked = true;
        
        if(statusCode == 20){
            for(uint i = 0; i < registeredFlights[flight].insurees.length; i++) {
                creditInsurees(flight, registeredFlights[flight].insurees[i].user);
            }
        }
    }

    function isAlreadyInsured(address user, string memory flight) external view requireIsOperational returns (bool) {
        if (insurees[user][flight] > 0){
            return true;
        } else {
            return false;
        }
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (      
                                string memory flight,
                                address user                     
                            )
                            external
                            payable
                            requireIsOperational
    {
        require(this.isAlreadyInsured(user, flight) != true, "Can't insure more than once");
        insurees[user][flight] = msg.value;
        Insuree memory newInsuree = Insuree(user, msg.value);
        registeredFlights[flight].insured = true;
        registeredFlights[flight].insurees.push(newInsuree);
        payable(address(this)).transfer(msg.value);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    string memory flight,
                                    address user

                                )
                                internal
                                requireIsOperational
                                
    {
        require(this.isAlreadyInsured(user, flight), "Not actually insured for this flight!");
        uint paid = insurees[user][flight];
        uint credit = paid + (paid * 50 / 100);
        credits[user] = credits[user] + credit;
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                                address user
                            )
                            external
                            payable
                            requireIsOperational
                            
    {
        require(credits[user] > 0, "You don't have any credit");
        uint amountOfCredit = credits[user];
        credits[user] = 0;
        payable(user).transfer(amountOfCredit);
        emit CreditPaid(user, amountOfCredit);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                                string memory airline,
                                address owner
                            )
                            public
                            requireIsOperational
                            payable
    {
        if(airlineOwners[owner] == false){
            airlineOwners[owner] = true;
            airlineOwnersCount += 1;
        }
        airlines[airline].funded = true;
        payable(address(this)).transfer(msg.value);
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */

    function receiveFunds() payable external {
        payable(address(this)).transfer(msg.value);
    }

    receive() external payable {
        emit Received(msg.value);
    }

    // Fallback
    fallback() 
                            external 
                            payable 
    {
    }


}

