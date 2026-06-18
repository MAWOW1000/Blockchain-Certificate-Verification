# Solidity Basics for Beginners

Solidity is a programming language used to write smart contracts on Ethereum.

A smart contract is a program stored on blockchain. Once deployed, people can call its functions using transactions.

## 1. Basic Contract Structure

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract MyContract {

}
```

Meaning:

```text
// SPDX-License-Identifier
```

Defines the license.

```text
pragma solidity ^0.8.28;
```

Defines the Solidity compiler version.

```text
contract MyContract
```

Creates a smart contract. It is similar to a class in object-oriented programming.

## 2. Variables

Variables store data.

Example:

```solidity
contract Example {
  uint256 public age = 20;
  string public name = "Alice";
  bool public isActive = true;
}
```

Meaning:

```text
uint256 age
```

Stores a positive whole number.

```text
string name
```

Stores text.

```text
bool isActive
```

Stores `true` or `false`.

```text
public
```

Allows other people/apps to read the variable.

## 3. Common Data Types

### uint

Unsigned integer. It cannot be negative.

```solidity
uint256 public score = 100;
```

Use it for:

```text
age
amount
counter
timestamp
```

### int

Integer that can be negative.

```solidity
int256 public temperature = -5;
```

Use it only when negative numbers are needed.

### bool

Boolean value.

```solidity
bool public isVerified = false;
```

Possible values:

```text
true
false
```

### string

Text value.

```solidity
string public studentName = "John";
```

Strings can cost more gas, so avoid storing large text on blockchain.

### address

Ethereum wallet or contract address.

```solidity
address public owner;
```

Example address:

```text
0x1234...
```

Use it for:

```text
admin wallet
issuer wallet
student wallet
```

### bytes32

Fixed-size 32-byte data.

```solidity
bytes32 public certificateHash;
```

Use it for:

```text
hashes
certificate IDs
unique keys
```

For your certificate project, `bytes32` is useful because hashes are normally 32 bytes.

## 4. Visibility

Visibility controls who can access a variable or function.

### public

Can be called from inside and outside the contract.

```solidity
uint256 public count;
```

For public variables, Solidity automatically creates a getter function.

### private

Can only be used inside the same contract.

```solidity
uint256 private secretNumber;
```

Important: `private` does not mean fully hidden from blockchain. Blockchain data can still be inspected. It only prevents direct access from other contracts.

### internal

Can be used inside the same contract and child contracts.

```solidity
uint256 internal value;
```

### external

Can only be called from outside the contract.

```solidity
function hello() external {

}
```

## 5. Functions

Functions are actions the contract can do.

```solidity
contract Example {
  uint256 public count;

  function increase() public {
    count = count + 1;
  }
}
```

Meaning:

```text
function increase()
```

Creates a function named `increase`.

```text
public
```

Anyone can call it.

```text
count = count + 1
```

Increases the stored number.

## 6. Function Return Values

Functions can return data.

```solidity
function getNumber() public pure returns (uint256) {
  return 10;
}
```

Meaning:

```text
returns (uint256)
```

This function returns a `uint256`.

```text
return 10
```

Returns the value `10`.

## 7. view and pure

### view

`view` means the function reads blockchain data but does not change it.

```solidity
uint256 public count = 5;

function getCount() public view returns (uint256) {
  return count;
}
```

### pure

`pure` means the function does not read or change blockchain data.

```solidity
function add(uint256 a, uint256 b) public pure returns (uint256) {
  return a + b;
}
```

## 8. require

`require` checks a condition.

If the condition is false, the transaction stops.

```solidity
function setAge(uint256 age) public {
  require(age > 0, "Age must be greater than zero");
}
```

Meaning:

```text
age > 0
```

The condition.

```text
"Age must be greater than zero"
```

Error message if the condition fails.

In your project:

```solidity
require(msg.sender == admin, "Only admin can do this");
```

This means only the admin wallet can continue.

## 9. msg.sender

`msg.sender` is the wallet address that called the function.

Example:

```solidity
contract Example {
  address public owner;

  constructor() {
    owner = msg.sender;
  }
}
```

If you deploy the contract, your wallet becomes `owner`.

## 10. Constructor

The constructor runs once when the contract is deployed.

```solidity
contract Example {
  address public owner;

  constructor() {
    owner = msg.sender;
  }
}
```

Use constructor for initial setup.

For your project:

```text
Set deployer as admin
Authorize deployer as first issuer
```

## 11. Struct

A `struct` groups related data.

```solidity
struct Student {
  string name;
  uint256 age;
  bool isActive;
}
```

Use it when one object has multiple fields.

For your project:

```solidity
struct Certificate {
  bytes32 certificateHash;
  address issuer;
  uint256 issuedAt;
  bool isRevoked;
  bool exists;
}
```

This groups all blockchain certificate data.

## 12. Mapping

A `mapping` is like a dictionary or key-value table.

```solidity
mapping(address => bool) public approvedUsers;
```

Meaning:

```text
address => bool
```

Each address maps to `true` or `false`.

Example:

```solidity
approvedUsers[msg.sender] = true;
```

For your project:

```solidity
mapping(address => bool) public authorizedIssuers;
```

This checks whether a university wallet is approved.

Another example:

```solidity
mapping(bytes32 => Certificate) private certificates;
```

This maps a certificate ID to certificate data.

## 13. Array

Arrays store lists.

```solidity
uint256[] public numbers;
```

Add item:

```solidity
numbers.push(10);
```

Get item:

```solidity
numbers[0];
```

Arrays are useful, but large arrays can become expensive on blockchain.

For your project, mappings are better than arrays for looking up certificates by ID.

## 14. Events

Events are blockchain logs.

```solidity
event UserCreated(address user);

function createUser() public {
  emit UserCreated(msg.sender);
}
```

Meaning:

```text
event UserCreated(address user)
```

Defines a log type.

```text
emit UserCreated(msg.sender)
```

Writes the log.

For your project:

```solidity
event CertificateIssued(bytes32 certificateId, bytes32 certificateHash, address issuer);
```

This logs when a certificate is issued.

## 15. Modifiers

Modifiers are reusable rules for functions.

```solidity
modifier onlyOwner() {
  require(msg.sender == owner, "Only owner");
  _;
}
```

Use it like this:

```solidity
function deleteData() public onlyOwner {

}
```

Meaning:

```text
onlyOwner
```

Runs the permission check before the function body.

```text
_;
```

Means continue to the function body after the check passes.

For your project:

```solidity
modifier onlyAdmin()
```

Protects admin-only functions.

## 16. If / Else

```solidity
function check(uint256 score) public pure returns (string memory) {
  if (score >= 50) {
    return "Pass";
  } else {
    return "Fail";
  }
}
```

Use it for conditional logic.

## 17. Loops

Solidity supports loops.

```solidity
for (uint256 i = 0; i < 5; i++) {
  // do something
}
```

But be careful. Loops can cost a lot of gas if they run many times.

For blockchain contracts, avoid loops over large data.

## 18. Memory, Storage, and Calldata

Solidity has different data locations.

### storage

Permanent blockchain storage.

```solidity
Certificate storage certificate = certificates[certificateId];
```

Changing this changes blockchain state.

### memory

Temporary data during function execution.

```solidity
string memory name = "Alice";
```

The data disappears after the function finishes.

### calldata

Read-only function input data.

```solidity
function setName(string calldata name) public {

}
```

Usually cheaper than `memory` for external function inputs.

## 19. Object-Oriented Programming in Solidity

Solidity supports some OOP concepts.

### Contract as Class

```solidity
contract CertificateRegistry {

}
```

A contract is similar to a class.

### State Variables as Fields

```solidity
address public admin;
```

This is like a class property.

### Functions as Methods

```solidity
function issueCertificate() public {

}
```

This is like a class method.

### Struct as Object Data

```solidity
struct Certificate {
  bytes32 certificateHash;
  address issuer;
}
```

This groups data like an object.

### Inheritance

One contract can inherit from another.

```solidity
contract Parent {
  uint256 public x;
}

contract Child is Parent {

}
```

`Child` receives variables and functions from `Parent`.

### Override

A child contract can override a parent function.

```solidity
contract Parent {
  function hello() public pure virtual returns (string memory) {
    return "Parent";
  }
}

contract Child is Parent {
  function hello() public pure override returns (string memory) {
    return "Child";
  }
}
```

Use `virtual` in parent and `override` in child.

## 20. Simple Complete Example

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract SimpleStorage {
  uint256 public number;
  address public owner;

  event NumberChanged(uint256 newNumber);

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can do this");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function setNumber(uint256 newNumber) public onlyOwner {
    number = newNumber;
    emit NumberChanged(newNumber);
  }

  function getNumber() public view returns (uint256) {
    return number;
  }
}
```

What this example teaches:

```text
state variable
event
modifier
constructor
function
require
msg.sender
view
```

## 21. Solidity Concepts You Need for This Project

For the certificate project, focus on these:

```text
contract
state variables
address
bytes32
bool
uint256
struct
mapping
event
modifier
constructor
require
msg.sender
block.timestamp
view function
storage
```

You do not need advanced Solidity first.

Learn enough to understand:

1. Who can issue certificates.
2. How certificate hashes are stored.
3. How verification checks work.
4. How revocation changes certificate status.
