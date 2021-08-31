// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
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
    function isOperational() public view returns(bool) {}
    function receiveFunds() external payable {}
    function setOperatingStatus(bool mode, address owner) external {}
    function getBalance() public view returns(uint256 amount) {}
    function checkIsFundedOwner(address owner) external view returns (bool) {}
    function checkHasVoted(string memory airline, address user) external view returns (bool) {}
    function updateAirline(string memory airline, Airline memory airlineDetails, address user, bool voted) public {}
    function getAirlineDetails(string memory airline) public view returns(Airline memory) {}
    function getAirlinesList() public view returns(string[] memory ){}
    function getRegisteredAirlinesCount() public view returns(uint8){}
    function getAirlineOwnersCount() public view returns(uint8){}
    function fund(string memory airline, address insuree) public payable {}
    function pay(address owner) public payable {}
    function registerFlight(string memory flight) public {}
    function updateFlightStatus(string memory flight, uint8 statusCode) public {}
    function getRegisteredFlight(string memory) external view returns (Flight memory) {}
    function isAlreadyInsured(address, string memory) public returns (bool) {}
    function buy(string memory flight, address user) public payable {}
}
/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Data contract
    FlightSuretyData dataContract;
    address public dataAddress;

    // Flight status codes
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    address private contractOwner;          // Account used to deploy contract
    
  
    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    struct ChangeOperationalStatusVote {
        mapping(address => bool) admin;
        uint8 count;
    }
    mapping(uint => ChangeOperationalStatusVote) changeOperationalStatus;
    uint8 changeStatusEvents;
    uint8 public requiredVotesForStatusChange;

    event OperationStatusChange(bool status);
    event RegisterAirline(string airline);
    event FundAirline(string airline);
    event RegisterFlight(string airline);
    event InsureFlight(string airline);

 
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
         // Modify to call data contract's status
       require(dataContract.isOperational() == true, "Contract is not Operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    modifier requireNotAlreadyChangedOperationalStatus()
    {   
        require(!changeOperationalStatus[changeStatusEvents].admin[msg.sender], "Already voted!");
        _;
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
   
    modifier requireFundedAirlineOwner()
    {
        require(dataContract.checkIsFundedOwner(msg.sender), "Caller is not funded airline owner");
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor
                                (
                                    address dataContractAddress,
                                    string memory airlineName
                                ) 
    {
        contractOwner = msg.sender;
        changeStatusEvents = 0;

        dataContract = FlightSuretyData(dataContractAddress);
        dataAddress = dataContractAddress;
        
        FlightSuretyData.Airline memory firstAirline;
        firstAirline.owner = msg.sender;
        firstAirline.registered = true;
        firstAirline.name = airlineName;
        dataContract.updateAirline(airlineName, firstAirline, msg.sender, false);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        bool operational = dataContract.isOperational();
        return operational;
    }

    function setIsOperational(bool updatedState) external requireFundedAirlineOwner requireNotAlreadyChangedOperationalStatus {
        require(updatedState != dataContract.isOperational(), "Operation state is already what you've requested");
        changeOperationalStatus[changeStatusEvents].count += 1;
        changeOperationalStatus[changeStatusEvents].admin[msg.sender] = true;

        uint8 activeAirlinesNumber = dataContract.getAirlineOwnersCount();

        uint8 requiredTotalVotes = uint8(activeAirlinesNumber / 2);
        uint8 currentCount = changeOperationalStatus[changeStatusEvents].count;

        if(requiredTotalVotes > currentCount){
            requiredVotesForStatusChange = requiredTotalVotes - currentCount;
        } else {
            requiredVotesForStatusChange = 0;
            changeStatusEvents += 1;
            dataContract.setOperatingStatus(updatedState, msg.sender);
            emit OperationStatusChange(updatedState);
        }

    }

    function getBalance() public view returns(uint256){
        return dataContract.getBalance();
    }
    function getAirlinesList() public view returns(string[] memory) {
        return dataContract.getAirlinesList();
    }    

    function getRegisteredAirlinesCount() public view returns(uint8){
        return dataContract.getRegisteredAirlinesCount();
    }
   
    function getAirlineOwnersCount() public view returns(uint8){
        return dataContract.getAirlineOwnersCount();
    }
 
    
    function getAirlineDetails(string memory airline) public view returns(FlightSuretyData.Airline memory airlineDetails) {
        return dataContract.getAirlineDetails(airline);
    }     

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

  
   /**
    * @dev Add an airline to the registration queue
    *
    */   
    function registerAirline
                            (   
                                string memory airline,
                                address owner
                            )
                            external
    {
        require(dataContract.checkIsFundedOwner(msg.sender), "Only funded owners can register new owners");
        FlightSuretyData.Airline memory oldData = dataContract.getAirlineDetails(airline);
        require(oldData.owner == address(0), "This airline has already been claimed");
        
        uint activeAirlinesNumber = dataContract.getAirlineOwnersCount();
        uint registeredAirlinesNumber = dataContract.getRegisteredAirlinesCount();
        FlightSuretyData.Airline memory airlineDetails;
        airlineDetails.owner = owner;
        airlineDetails.name = airline;
        
        if(registeredAirlinesNumber < 4){
            airlineDetails.registered = true;
        } else {
            uint8 requiredVotesForAirlineApproval = uint8(activeAirlinesNumber / 2);
            
            if(requiredVotesForAirlineApproval < 2){
                airlineDetails.requiredVotes = 2;
            } else {
                airlineDetails.requiredVotes = requiredVotesForAirlineApproval;
            }

            airlineDetails.votes = 1;
        }
        dataContract.updateAirline(airline, airlineDetails, msg.sender, true);
        if(airlineDetails.registered){
            emit RegisterAirline(airline);
        }
    }

    function checkHasVoted(string memory airline) external view returns (bool) {
        return dataContract.checkHasVoted(airline, msg.sender);
    }
 
    function approveAirline
                            (   
                                string memory airline
                            )
                            external
    {
        require(dataContract.checkIsFundedOwner(msg.sender), "Only funded owners can approve new owners");
        require(dataContract.checkHasVoted(airline, msg.sender) == false, "You've already approved this");
        
        FlightSuretyData.Airline memory oldData = dataContract.getAirlineDetails(airline);
        FlightSuretyData.Airline memory airlineDetails = oldData;
        airlineDetails.votes += 1;
        
        if (airlineDetails.votes == airlineDetails.requiredVotes){
            airlineDetails.registered = true;
        }
        dataContract.updateAirline(airline, airlineDetails, msg.sender, true);
        if(airlineDetails.registered){
            emit RegisterAirline(airline);
        }
    }

    uint256 public constant AIRLINE_FUNDING_MINIMUM = 1 ether;

    function fundAirline(string memory airline) payable public {
        require(msg.value >= AIRLINE_FUNDING_MINIMUM, "Must pay at least 1 ether to fund airline!");
        dataContract.fund{value: msg.value}(airline, msg.sender);
        emit FundAirline(airline);
    }

    function getRegisteredFlight(string memory flight) public view returns (FlightSuretyData.Flight memory flightData) {
        flightData = dataContract.getRegisteredFlight(flight);
        return flightData;
    }
    

   /**
    * @dev Register a future flight for insuring.
    *
    */  
    function registerFlight
                                (
                                    string memory flight
                                )
                                external
    {
        require(dataContract.getRegisteredFlight(flight).registered != true,"Flight mustn't be registered already");
        dataContract.registerFlight(flight);
        emit RegisterFlight(flight);
    }
   
    uint256 public constant FLIGHT_INSURANCE_MAXIMUM = 0.1 ether;

    function buyInsurance
                                (
                                    string memory flight
                                )
                                external
                                payable
    {
        require(msg.value > 0,"Can't insure for 0");
        require(msg.value <= FLIGHT_INSURANCE_MAXIMUM,"Can't insure for more than 0.1 ether ");
        require(dataContract.getRegisteredFlight(flight).registered == true,"Flight must be registered");
        require(dataContract.isAlreadyInsured(msg.sender, flight) != true, "Already bought insurance");
        dataContract.buy{value: msg.value}(flight, msg.sender);
        emit InsureFlight(flight);
    }

    function getRefund() external payable {
        dataContract.pay(msg.sender);
    }
    
   /**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus
                                (
                                    string memory flight,
                                    uint8 statusCode
                                )
                                internal
    {
        dataContract.updateFlightStatus(flight, statusCode);
    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus
                        (
                            string memory flight
                        )
                        external
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, flight));
        oracleResponses[key].requester = msg.sender;
        oracleResponses[key].isOpen = true;

        emit OracleRequest(index, flight);
    } 


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 0.1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(string flight,  uint8 status);

    event OracleReport( string flight, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, string flight);


    // Register an oracle with the contract
    function registerOracle
                            (
                            )
                            external
                            payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });

                                    dataContract.receiveFunds{value: msg.value}();
    }
    function getOracle
                            (
                            )
                            external
                            view
                            returns (Oracle memory)
    {
       return oracles[msg.sender];
    }

    function getMyIndexes
                            (
                            )
                            view
                            external
                            returns(uint8[3] memory)
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
                        (
                            uint8 index,
                            string memory flight,
                            uint8 statusCode
                        )
                        external
    {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");


        bytes32 key = keccak256(abi.encodePacked(index, flight)); 
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport( flight, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo( flight, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(flight, statusCode);
        } else {
            processFlightStatus(flight, 10);
        }
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

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
                            (                       
                                address account         
                            )
                            internal
                            returns(uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            internal
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}


