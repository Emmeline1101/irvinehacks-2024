import React, { useState } from 'react'; 
import './App.css';
import Nav from './nav/nav';
import Home from './home/home'; 
import Middle from './middle/middle';

// Retrieve data from localStorage
const localItemData = localStorage.getItem('items');
const localExpiringData = localStorage.getItem('expiring');
const localExpiredData = localStorage.getItem('expired');

// Parse data from localStorage, or initialize to empty arrays if data doesn't exist
const localItems = localItemData == null ? [] : JSON.parse(localItemData);
const localExpiring = localExpiringData == null ? [] : JSON.parse(localExpiringData);
const localExpired = localExpiredData == null ? [] : JSON.parse(localExpiredData);



// Function to check if an item is expired
function isExpired(item) {
  if (!Date.parse(item.expiration_date)) { //convert the time into timestamp to check whether it is valid
    return false; // if cannot convert, return false
  }
  const date = new Date(item.expiration_date);//convert it back
  return date.getTime() < Date.now();
}

// Function to check if an item is expiring soon
function isExpiring(item) {
  if (!Date.parse(item.expiration_date)) {
    return false;
  }
  const date = new Date(item.expiration_date);
  return (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 7;
}

// Main App component
function App() {
  //  State variables for items, expired items, and expiring items
  const [items, setItems] = useState(localItems)

  const [expiredItems, setExpiredItems] = useState(localExpired)//update the value of expiredItems via setExpiredItems function

  const [expiringItems, setExpiringItems] = useState(localExpiring)

  // Function to update expired items
  function updateExpiredItems(newItems) {
    localStorage.setItem('expired', JSON.stringify(newItems));//convert the item into JSON format, and set 'expired' as the key
    setExpiredItems(newItems);//update UI
  }

  // Function to update expiring items
  function updateExpiringItems(newItems) {
    while (newItems.length > 0 && isExpired(newItems[0])) {
      updateExpiredItems([...expiredItems, newItems[0]]);//generate a new array by using '...'
      newItems.shift();// remove the first element and then remove it
    }
    localStorage.setItem('expiring', JSON.stringify(newItems));
    setExpiringItems(newItems);
  }

  // Function to add expiring items
  function addExpiringItems(toExpiring) {
    var newItems = [...expiringItems, ...toExpiring]
    while (newItems.length > 0 && isExpired(newItems[0])) {
      updateExpiredItems([...expiredItems, newItems[0]]);
      newItems.shift();
    }
    localStorage.setItem('expiring', JSON.stringify(newItems));
    setExpiringItems(newItems);
  }

    // Function to update all items
  function updateItems(newItems) {
    var toExpire = []
    var toExpiring = []

    while (newItems.length > 0 && isExpired(newItems[0]))
    {
      toExpire.push(newItems[0])
      newItems.shift();
    }
    while (newItems.length > 0 && isExpiring(newItems[0]))
    {
      toExpiring.push(newItems[0])
      newItems.shift();
    }
    updateExpiredItems([...expiredItems, ...toExpire])
    addExpiringItems(toExpiring);
    localStorage.setItem('items', JSON.stringify(newItems))
    setItems(newItems);
   
  }
  
  // Render JSX structure
  return (
    <div className="root">
      {/* ... -- split the array into element */}
      <Nav items={[...expiringItems, ...items]}/>
      <Middle expired={expiredItems} setExpired={updateExpiredItems} expiring={expiringItems} setExpiring={updateExpiringItems}/>
      <Home items={items} setItems={(i) => updateItems(i)}/>
    </div>
  );
}



export default App;
