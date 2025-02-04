var globalXmlData = null;
var ownerGamesVisibility = {};
var currentActiveOverlays = {
    websiteOverlay: null,
    addActionOverlay: null
};
const loginModal = document.getElementById("loginModal");
const signUpModal = document.getElementById("signUpModal");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const closeLoginModal = document.getElementById("closeLoginModal");
const closeSignUpModal = document.getElementById("closeSignUpModal");
const signUpButton = document.getElementById("signUpButton");
const loginButton = document.getElementById("loginButton");
const submitLoginButton = document.getElementById("submitLoginButton");
const userStatus = document.getElementById("userStatus");
let activeTab = "Home";

// Import Firebase modules
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Get references to Firebase services
const auth = getAuth(); // Uses the app initialized in index.html
const db = getFirestore(); // Uses the same app

// Authentication Functions
function signUp(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            console.log("User signed up");
            login(email, password);
            signUpModal.style.display = "none";
        })
        .catch(error => {
            console.error("Error during signup:", error.message);
            alert("Sign-up failed, try again...");
        });
}

function login(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            console.log("User logged in");
            alert("Login successful!");
            // Close the login modal
            const loginModal = document.getElementById("loginModal");
            loginModal.style.display = "none";
        })
        .catch(error => {
            console.error("Error during login:", error.message);
            alert("Login failed, try again...");
        });
}

logoutButton.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            console.log("User logged out.");
            alert("Logout successful!");
        })
        .catch((error) => {
            console.error("Error during logout:", error.message);
            alert("Logout failed, try again...");
        });
});

// Monitor User State
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        userStatus.textContent = user.email;
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
    } else {
        // User is not logged in
        userStatus.textContent = "Not Logged In";
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
    }

    // Call the appropriate function for the active tab
    if (activeTab === "Games") {
        displayGamesTab();
    } else if (activeTab === "ModifyGames") {
        populateLibraryDropdown();
    }
});

// Open modal
function openLoginModal() {
    loginModal.style.display = "block";
}

// Close modal
closeLoginModal.addEventListener("click", () => {
    loginModal.style.display = "none";
});

// Close modal if clicking outside the modal
window.addEventListener("click", (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = "none";
    }
});

// Open modal
loginButton.addEventListener("click", () => {
    loginModal.style.display = "block";
});

// Close modal
closeLoginModal.addEventListener("click", () => {
    loginModal.style.display = "none";
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
});

// Open and close the sign-up modal
signUpButton.addEventListener("click", () => {
    loginModal.style.display = "none"; // Close login modal
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
    signUpModal.style.display = "block"; // Open sign-up modal
});

closeSignUpModal.addEventListener("click", () => {
    signUpModal.style.display = "none";
    document.getElementById("signUpEmail").value = "";
    document.getElementById("signUpPassword").value = "";
    document.getElementById("confirmPassword").value = "";
});

// Open the forgot password modal
document.getElementById("forgotPasswordLink").addEventListener("click", () => {
    document.getElementById("forgotPasswordModal").style.display = "block";
    document.getElementById("loginModal").style.display = "none";
});

// Close the forgot password modal
document.getElementById("closeForgotPasswordModal").addEventListener("click", () => {
    document.getElementById("forgotPasswordModal").style.display = "none";
    document.getElementById("forgotPasswordEmail").value = "";
});

// Send password reset email
document.getElementById("submitForgotPasswordButton").addEventListener("click", () => {
    const email = document.getElementById("forgotPasswordEmail").value;

    if (!email) {
        alert("Please enter your email address.");
        return;
    }

    sendPasswordResetEmail(auth, email) // Pass the auth instance as the first argument
        .then(() => {
            alert("Password reset email sent! Please check your inbox.");
            document.getElementById("forgotPasswordModal").style.display = "none";
            document.getElementById("forgotPasswordEmail").value = ""; // Clear the email field
        })
        .catch(error => {
            console.error("Error sending password reset email:", error.message);
            alert("Failed to send reset email. Please try again.");
        });
});

// Close modals if clicking outside them
window.addEventListener("click", (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = "none";
        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";
    }
    if (event.target === signUpModal) {
        signUpModal.style.display = "none";
        document.getElementById("signUpEmail").value = "";
        document.getElementById("signUpPassword").value = "";
        document.getElementById("confirmPassword").value = "";
    }
    if (event.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = "none";
	document.getElementById("forgotPasswordEmail").value = "";
    }
});

// Handle login
submitLoginButton.addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Call the existing login function
    login(email, password);

    // Clear the input fields after submission
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
});

// Handle sign-up
submitSignUpButton.addEventListener("click", () => {
    const email = document.getElementById("signUpEmail").value;
    const password = document.getElementById("signUpPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        document.getElementById("signUpPassword").value = "";
        document.getElementById("confirmPassword").value = "";
        return;
    }

    signUp(email, password);

    // Clear the input fields after submission
    document.getElementById("signUpEmail").value = "";
    document.getElementById("signUpPassword").value = "";
    document.getElementById("confirmPassword").value = "";
});

// Define Library functions
function isLoggedIn() {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to access this feature.");
        loginModal.style.display = "block";
        return false;
    }
    return true;
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    // Hide all tab content
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove the "active" clas from all buttons
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    if (tabName === 'Games') {
        displayGamesTab();
    }

    if (tabName === 'ModifyGames') {
        populateLibraryDropdown();
        document.getElementById('bggUsername').value = '';
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('bggSearchQuery').value = '';
        document.getElementById('libraryResults').innerHTML = '';
    }

    // Update the active tab
    activeTab = tabName;

    // Show the selected tab and set the clicked button as active
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Attach event listeners to the buttons
document.getElementById("homeTab").addEventListener("click", (event) => openTab(event, "Home"));
document.getElementById("gamesTab").addEventListener("click", (event) => openTab(event, "Games"));
document.getElementById("modifyGamesTab").addEventListener("click", (event) => openTab(event, "ModifyGames"));
document.getElementById("libraryDropdown").addEventListener("change", handleLibraryChange);
document.getElementById("getCollectionButton").addEventListener("click", getCollection);
document.getElementById("searchGamesButton").addEventListener("click", () => searchGames(document.getElementById("searchGamesButton")));
document.getElementById("searchLibraryButton").addEventListener("click", () => searchLibrary(document.getElementById("searchLibraryButton")));

// Automatically open the default tab on page load
document.getElementById("homeTab").click();

function getCollection() {
    if (!isLoggedIn()) return;
    
    var username = document.getElementById('bggUsername').value;
    var libraryDropdown = document.getElementById('libraryDropdown');
    var selectedLibrary = libraryDropdown.value;
    var statusDiv = document.getElementById('statusMessage');
    
    if (username && selectedLibrary && selectedLibrary !== 'newLibrary') {
        statusDiv.innerHTML = 'Fetching Collection...';
        fetch(`https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username)}&own=1&version=1`)
            .then(response => {
                if (response.status === 202) {
                    // Request is queued, show retry message and retry after some delay
                    statusDiv.innerHTML = 'Shelving Games. Please Wait...';
                    setTimeout(() => getCollection(), 10000); // Retry after 10 seconds
                } else if (response.ok) {
                    return response.text();
                } else {
                    statusDiv.innerHTML = '';
                    throw new Error('Network response was not ok.');
                }
            })
            .then(str => {
                if (str) {
                    return (new window.DOMParser()).parseFromString(str, "text/xml");
                }
            })
            .then(data => {
                if (data) {
                    globalXmlData = data;
                    prepareData(data);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert ('An error occurred. Please try again.');
                statusDiv.innerHTML = '';
            });
    } else {
        if (!username) {
            alert ('Please Enter A Username.');
            statusDiv.innerHTML = '';
        } else {
            alert ('Please Choose A Library First.');
            statusDiv.innerHTML = '';
        }
    }
}

function prepareData(data) {
    var extractedData = [];
    var items = data.getElementsByTagName('item');
    var statusDiv = document.getElementById('statusMessage');

    for (var i = 0; i < items.length; i++) {
        var name = items[i].getElementsByTagName('name')[0].textContent;
        var objectId = items[i].getAttribute('objectid');
        var objectIdNum = Number(objectId); // Convert objectId to a number

        // Check if the thumbnail element exists
        var thumbnailElements = items[i].getElementsByTagName('thumbnail');
        var thumbnail = '';
        if (thumbnailElements.length > 0) {
            thumbnail = thumbnailElements[0].textContent;
        } else {
            // Set a default thumbnail or handle the absence of a thumbnail
            thumbnail = './no-image.png';
        }

        var status = '[]';
	var newGame = 'Y';
        extractedData.push({ name, objectId: objectIdNum, thumbnail, status, newGame });
    }

    // Display an alert with the first 10 names and ask for confirmation
    var firstSet = extractedData.slice(0, 10).map(game => game.name).join('\n');
    var confirmation = confirm(`Here are the first 10 games from this collection:\n\n${firstSet}\n\nDoes this look correct?`);

    if (confirmation) {
        fetchExistingGames().then(gamesDataFromSheet => {
            var objectIdsInXML = extractedData.map(game => game.objectId);
            var gamesToRemove = gamesDataFromSheet.filter(game => !objectIdsInXML.includes(game.objectId));

            gamesToRemove.forEach(game => {
                if (confirm(`Remove "${game.name}" from the sheet?`)) {
                    // Send removal request to Google Apps Script
                    removeFromGoogleSheet(game.objectId);
                }
            });

            var uniqueGames = extractedData.filter(game => !gamesDataFromSheet.map(g => g.objectId).includes(game.objectId));
            if (uniqueGames.length > 0) {
                sendToGoogleSheet({ games: uniqueGames });
                alert (`${uniqueGames.length} new game(s) added.`);
                statusDiv.innerHTML = '';
            } else {
                alert ('No new games to add.');
                statusDiv.innerHTML = '';
            }
        });
    } else {
        statusDiv.innerHTML = '';
    }
}

function fetchExistingGames() {
    var selectedLibrary = document.getElementById('libraryDropdown').value;
    var url = `https://script.google.com/macros/s/AKfycbxlhxw69VE2Nx-_VaGzgRj1LcogTvmcfwjoQ0n9efEpDo0S1evEC1LlDZdQV8VjHdn-cQ/exec?library=${selectedLibrary}`;

    return fetch(url)
        .then(response => response.json())
        .then(existingObjectIds => existingObjectIds)
        .catch(error => console.error('Error:', error));
}

function fetchAllGames() {
    var selectedLibrary = "ALLGAMESLIBRARY";
    var url = `https://script.google.com/macros/s/AKfycbxlhxw69VE2Nx-_VaGzgRj1LcogTvmcfwjoQ0n9efEpDo0S1evEC1LlDZdQV8VjHdn-cQ/exec?library=${selectedLibrary}`;

    return fetch(url)
        .then(response => response.json())
        .then(existingObjectIds => existingObjectIds)
        .catch(error => console.error('Error:', error));
}

function fetchGameDetails(gameId) {
    const detailsUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&versions=1`;

    fetch(detailsUrl)
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            var items = data.getElementsByTagName('item');
            if (items.length > 0) {
                var objectId = items[0].getAttribute('id');
                var thumbnails = items[0].getElementsByTagName('thumbnail');
                if (thumbnails.length > 0) {
                    var thumbnailUrl = thumbnails[0].textContent;
                    var thumbnailImg = document.getElementById('thumbnail-' + objectId);
                    if (thumbnailImg) {
                        thumbnailImg.src = thumbnailUrl;
                        thumbnailImg.style.display = 'block'; // Make it visible
                    }
                }
            }
        })
        .catch(error => console.error('Error fetching game details:', error));
}

function searchGames(button) {
    if (!isLoggedIn()) return;
    
    var libraryDropdown = document.getElementById('libraryDropdown');
    var selectedLibrary = libraryDropdown.value;

    if (selectedLibrary && selectedLibrary !== 'newLibrary') {
        var query = document.getElementById('bggSearchQuery').value;
        var searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`;

        fetch(searchUrl)
            .then(response => response.text())
            .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
            .then(data => displaySearchResults(data, button));
    } else {
        alert ('Please select a library first.');
    }
}

function displaySearchResults(data, button) {
    var items = data.getElementsByTagName('item');
    var resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = ''; // Clear previous results

    var rowDiv = document.createElement('div');
    rowDiv.className = 'result-row';
    resultsDiv.appendChild(rowDiv);

    const maxItemsToShow = 18; // Maximum number of items to display
    for (var i = 0; i < Math.min(items.length, maxItemsToShow); i++) {
        var objectId = items[i].getAttribute('id');
        var name = items[i].getElementsByTagName('name')[0].getAttribute('value');

        var resultDiv = document.createElement('div');
        resultDiv.className = 'result-item'; // CSS class for styling

        var thumbnailImg = document.createElement('img');
        thumbnailImg.id = 'thumbnail-' + objectId; // Unique ID for the thumbnail
        thumbnailImg.alt = 'Loading thumbnail...';
        thumbnailImg.className = 'thumbnail-img'; // CSS class for styling

        var nameDiv = document.createElement('div');
        nameDiv.innerHTML = name;
        nameDiv.className = 'game-name'; // CSS class for styling

        resultDiv.appendChild(thumbnailImg);
        resultDiv.appendChild(nameDiv);

        var status = '[]';
	var newGame = 'Y';

        // Setup click event
        resultDiv.onclick = createClickHandler(name, objectId, thumbnailImg, status, newGame, resultDiv);

        rowDiv.appendChild(resultDiv);

        // Fetch and display game details including the thumbnail
        fetchGameDetails(objectId);
    }

    button.scrollIntoView({ behavior: 'smooth' });
}

function displayGamesTab() {
    showLoadingOverlay();

    console.time("fetchAllGames");
    fetchAllGames().then(gamesData => {
	console.timeEnd("fetchAllGames");

	console.time("processAndBuildDOM");
        const user = auth.currentUser ? auth.currentUser : { email: "nouser@email.com" };
        var gamesDiv = document.getElementById('Games');
        gamesDiv.innerHTML = '<h1>Make Your Selections</h1>'; // Clear previous content and add title

        // Create checkbox for toggling visibility
        var checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'checkbox-container';
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'showSelected';
        checkbox.className = 'large-checkbox';
        checkbox.checked = false;
        var label = document.createElement('label');
        label.htmlFor = 'showSelected';
        label.textContent = ' Only show selected games';

        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        gamesDiv.appendChild(checkboxDiv);

	// Filter out LibraryMetadata entries
        gamesData = gamesData.filter(game => game.owner.toLowerCase() !== "librarymetadata");

	// Sort the gamesData: Group by owner, new games first within each group, then alphabetically by name
	var sortedGames = gamesData.sort((a, b) => {
	    // Group by owner
	    if (a.owner !== b.owner) {
	        return a.owner.localeCompare(b.owner); // Alphabetical by owner
	    }
	
	    // Within the same owner, prioritize new games
	    if (a.newGame === "Y" && b.newGame !== "Y") return -1;
	    if (a.newGame !== "Y" && b.newGame === "Y") return 1;
	
	    // If both are the same type (new or not), sort alphabetically by name
	    return a.name.localeCompare(b.name);
	});


        var currentOwner = null;
        var ownerDiv;
        var rowDiv;

        sortedGames.forEach(game => {
            if (game.owner !== currentOwner) {
                // Create a new div for each owner
                currentOwner = game.owner;
                ownerDiv = document.createElement('div');
                ownerDiv.className = 'owner-games';
                ownerDiv.style.display = 'none';

                // Create a header for the owner's games
                var ownerHeader = document.createElement('h2');
                ownerHeader.innerHTML = `${currentOwner.charAt(0).toUpperCase()}${currentOwner.slice(1)}'s Games`;
                ownerHeader.className = 'owner-header';
                ownerHeader.onclick = createOwnerHeaderClickHandler(ownerHeader, ownerDiv);

                gamesDiv.appendChild(ownerHeader);

                // Create a single rowDiv for this owner
                rowDiv = document.createElement('div');
                rowDiv.className = 'result-row';
                ownerDiv.appendChild(rowDiv);

                gamesDiv.appendChild(ownerDiv);
            }

            var resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';
            
            let statusArray = [];
            try {
                statusArray = JSON.parse(game.status || "[]");
            } catch (error) {
                console.error("Error parsing status for game:", game.name, error);
            }

            // Set background color based on the parsed status
            if (statusArray.includes(user.email)) {
                resultDiv.style.backgroundColor = "darkgreen"; // Current user selected
            } else if (statusArray.length > 0) {
                resultDiv.style.backgroundColor = "lightgreen"; // At least one user selected
            } else {
                resultDiv.style.backgroundColor = ""; // Default background
            }

            resultDiv.dataset.status = statusArray;

            var thumbnailImg = document.createElement('img');
            thumbnailImg.src = game.thumbnail; // Assuming thumbnail URL is available
            thumbnailImg.alt = game.name;
            thumbnailImg.className = 'thumbnail-img';

            var nameDiv = document.createElement('div');
            nameDiv.innerHTML = game.name;
            nameDiv.className = 'game-name';

	    if (game.newGame === "Y") {
		    // Create a "New Game" indicator
		    const newGameIndicator = document.createElement('img');
		    newGameIndicator.src = './new.png'; // Path to the "new game" icon
		    newGameIndicator.alt = 'New Game';
		    newGameIndicator.style = `
		        position: absolute; 
		        top: -10px; 
		        left: -10px; 
		        width: 40px; 
		        height: 40px; 
		    `;
		
		    // Append the "New Game" indicator to the resultDiv
		    resultDiv.appendChild(newGameIndicator);
		}

            // Create overlays but keep them hidden initially
            var websiteOverlay = document.createElement('div');
            websiteOverlay.style = 'position: absolute; top: 0; left: 0; width: 100%; height: 50%; background-color: rgba(255, 0, 0, 0.5); color: white; display: flex; justify-content: center; align-items: center; display: none; border-top-left-radius: 1rem; border-top-right-radius: 1rem; text-shadow: 2px 2px 4px #000000;';
            var websiteText = document.createElement('span');
            websiteText.textContent = 'View On BGG';
            websiteText.style = `background-color: rgba(0, 0, 0, 0.5); padding: 0.5rem 1rem; border-radius: 0.5rem;`;
            websiteOverlay.appendChild(websiteText);
            websiteOverlay.onclick = function(event) {
                window.open(`https://boardgamegeek.com/boardgame/${game.objectId}`, '_blank');
                hideOverlays(websiteOverlay, addActionOverlay);
                // Re-enable showing overlays on click
                resultDiv.onclick = showOverlaysFunction(resultDiv, websiteOverlay, addActionOverlay);
                event.stopPropagation(); // Prevent triggering clicks on underlying elements
            };

            var addActionOverlay = document.createElement('div');
		addActionOverlay.style = `
		    position: absolute; 
		    bottom: 0; 
		    right: 0; 
		    width: 100%; 
		    height: 50%; 
		    background-color: rgba(0, 255, 0, 0.5); 
		    color: white; 
		    display: flex; 
		    justify-content: center; 
		    align-items: center; 
		    display: none;
		    border-bottom-left-radius: 1rem; 
		    border-bottom-right-radius: 1rem; 
		    text-shadow: 2px 2px 4px #000000;
		`;
		
		// Create an image element for the "Add/Remove" icon
		var addActionImage = document.createElement('img');
		addActionImage.src = './thumbUp.png'; // Path to the image
		addActionImage.alt = 'Add/Remove';
		addActionImage.style = `
		    width: 90px; 
		    height: 90px; 
		`;
		
		// Append the image to the overlay
		addActionOverlay.appendChild(addActionImage);

		// Update the color of the image based on data-status
		function updateThumbColor() {
		    const status = resultDiv.dataset.status || "";
		    const hasUsers = status.trim() !== ""; // Check if there are any users in data-status
		    addActionImage.style.filter = hasUsers ? "none" : "grayscale(100%)"; // Gray if no users
		}
		
		// Call updateThumbColor initially and on data-status changes
		updateThumbColor();

		var userCountIndicator = document.createElement('div');
		userCountIndicator.style = `
		    position: absolute; 
		    top: 0px; 
		    right: 0px; 
		    width: 32px; 
		    height: 32px; 
		    border-radius: 16px; 
		    background-color: rgba(0, 0, 0, 0.5); 
		    color: white; 
		    display: flex; 
		    justify-content: center; 
		    align-items: center; 
		    font-weight: bold;
		    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
		`;
		
		// Append the indicator to the resultDiv
		resultDiv.appendChild(userCountIndicator);

		// Function to update the user count and the indicator's visibility
		function updateUserCount() {
		    const status = resultDiv.dataset.status || "";
		    const statusArray = status ? status.split(",") : []; // Split users by commas
		    userCountIndicator.textContent = statusArray.length; // Update the count
		    userCountIndicator.style.display = statusArray.length > 0 ? "flex" : "none"; // Hide if no users
		}
		
		// Initial update of the user count
		updateUserCount();
		
		// Click handler for the overlay
		addActionOverlay.onclick = function(event) {
		    createGameClickHandler(game, resultDiv)();
		    hideOverlays(websiteOverlay, addActionOverlay);
		    updateThumbColor();
		    updateUserCount();
		    // Re-enable showing overlays on click
		    resultDiv.onclick = showOverlaysFunction(resultDiv, websiteOverlay, addActionOverlay);
		    event.stopPropagation(); // Prevent triggering clicks on underlying elements
		};


            resultDiv.style.position = 'relative';
            resultDiv.appendChild(websiteOverlay);
            resultDiv.appendChild(addActionOverlay);

            // Initial click on the game item shows the overlays
            resultDiv.onclick = showOverlaysFunction(resultDiv, websiteOverlay, addActionOverlay);

            resultDiv.appendChild(thumbnailImg);
            resultDiv.appendChild(nameDiv);

            rowDiv.appendChild(resultDiv);
        });

	console.timeEnd("processAndBuildDOM");
        hideLoadingOverlay();

        checkbox.addEventListener('change', function() {
	    const allGameItems = document.querySelectorAll('.result-item');
	    allGameItems.forEach(item => {
	        // Check if data-status contains any text (indicating users)
	        const hasUsers = item.dataset.status && item.dataset.status.trim() !== "";
	
	        // Apply display logic
	        if (this.checked) {
	            if (!hasUsers) {
	                item.style.display = 'none'; // Hide games with no users
	            }
	        } else {
	            item.style.display = ''; // Show all games
	        }
	    });
	});
    });
}

function showOverlaysFunction(resultDiv, websiteOverlay, addActionOverlay) {
    return function() {
        // If the clicked game is already showing its overlays, hide them
        if (currentActiveOverlays.websiteOverlay === websiteOverlay &&
            currentActiveOverlays.addActionOverlay === addActionOverlay &&
            websiteOverlay.style.display !== 'none') {
            hideCurrentActiveOverlays(); // This will hide the overlays and reset currentActiveOverlays
        } else {
            // Hide any currently active overlays before showing the new ones
            hideCurrentActiveOverlays();
            websiteOverlay.style.display = 'flex';
            addActionOverlay.style.display = 'flex';
            // Update current active overlays to the new ones
            currentActiveOverlays.websiteOverlay = websiteOverlay;
            currentActiveOverlays.addActionOverlay = addActionOverlay;
        }
    };
}

function hideOverlays(websiteOverlay, addActionOverlay) {
    websiteOverlay.style.display = 'none';
    addActionOverlay.style.display = 'none';
}

function hideCurrentActiveOverlays() {
    if (currentActiveOverlays.websiteOverlay && currentActiveOverlays.addActionOverlay) {
        currentActiveOverlays.websiteOverlay.style.display = 'none';
        currentActiveOverlays.addActionOverlay.style.display = 'none';
    }
    // Reset current active overlays
    currentActiveOverlays = {
        websiteOverlay: null,
        addActionOverlay: null
    };
}

function searchLibrary(button) {
    if (!isLoggedIn()) return;

    var libraryDropdown = document.getElementById('libraryDropdown');
    var selectedLibrary = libraryDropdown.value;

    if (selectedLibrary && selectedLibrary !== 'newLibrary') {
        showLoadingOverlay(); // Show the overlay before starting the fetch
        document.getElementById('libraryResults').innerHTML = '';

        fetchExistingGames()
            .then(gamesData => {
                var gamesDiv = document.getElementById('libraryResults');
                gamesDiv.innerHTML = ''; // Clear previous content and add title

                // Sort the gamesData alphabetically
                var sortedGames = gamesData.sort((a, b) => a.name.localeCompare(b.name));

                var currentRow;
                currentRow = document.createElement('div');
                currentRow.className = 'result-row';
                gamesDiv.appendChild(currentRow);

                sortedGames.forEach((game) => {
                    var resultDiv = document.createElement('div');
                    resultDiv.className = 'result-item';
        
                    var thumbnailImg = document.createElement('img');
                    thumbnailImg.src = game.thumbnail; // Assuming thumbnail URL is available
                    thumbnailImg.alt = game.name;
                    thumbnailImg.className = 'thumbnail-img';

                    var nameDiv = document.createElement('div');
                    nameDiv.innerHTML = game.name;
                    nameDiv.className = 'game-name';

                    resultDiv.onclick = createRemoveClickHandler(game, resultDiv);

                    resultDiv.appendChild(thumbnailImg);
                    resultDiv.appendChild(nameDiv);

                    currentRow.appendChild(resultDiv);
                });

                hideLoadingOverlay(); // Hide the overlay once loading is complete
            })
            .catch(error => {
                alert('An error occurred while loading the library. Please try again.');
                console.error(error);
                hideLoadingOverlay(); // Ensure overlay is hidden on error
            });

        button.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert('Select A Library First');
    }
}

function toggleOwnerGames(ownerDiv) {
    // Toggle showing or hiding the list of games for the owner
    ownerDiv.style.display = ownerDiv.style.display === 'none' ? 'block' : 'none';
}

function createClickHandler(name, objectId, thumbnailImg, status, newGame, resultDiv) {
    if (!isLoggedIn()) return;
    
    return function() {
        var extractedData = [{ name, objectId: Number(objectId), thumbnail: thumbnailImg.src, status, newGame }];
        
        fetchExistingGames().then(gamesDataFromSheet => {
            var uniqueGames = extractedData.filter(game => !gamesDataFromSheet.map(g => g.objectId).includes(game.objectId));
            if (uniqueGames.length > 0) {
                sendToGoogleSheet({ games: uniqueGames });
            } else {
                alert ('Game Was Already In Library');
            }
        });

        // Update the background color
        resultDiv.style.backgroundColor = 'green';
        resultDiv.style.animation = 'spin-grow 1s linear forwards';
    };
}

function createRemoveClickHandler(game, resultDiv) {
    if (!isLoggedIn()) return;
    
    return function() {
        removeFromGoogleSheet(game.objectId);

        // Apply CSS animation
        resultDiv.style.backgroundColor = 'red';
        resultDiv.style.animation = 'spin-shrink-fade 1s ease-out forwards';

        // Remove the element from the DOM after the animation ends
        resultDiv.addEventListener('animationend', function() {
            resultDiv.remove();
        });
    };
}

function createGameClickHandler(game, resultDiv) {
	return function () {
		if (!isLoggedIn() || game.animating) return; // Prevent handling clicks if animation is ongoing

	        const user = auth.currentUser;
	
	        game.animating = true; // Set the animating flag
	
	        // Parse the status array from the game's status field
	        let statusArray = [];
	        try {
	            	statusArray = JSON.parse(game.status || "[]");
	        } catch (error) {
	            	console.error("Error parsing game status:", error);
	        }

		var action = "remove";
	        // Toggle the current user's email in the array
	        if (statusArray.includes(user.email)) {
	            	// Remove the user if already in the array
	            	statusArray = statusArray.filter(email => email !== user.email);
			action = "remove";
	        } else {
	            	// Add the user if not already in the array
	            	statusArray.push(user.email);
			action = "add";
	        }
	
	        // Update the game.status to the updated array as a JSON string
	        game.status = JSON.stringify(statusArray);
		resultDiv.dataset.status = statusArray;
	
		// Send the updated status to Google Sheets
	        updateGameInSheet(game, action);
	
	        // Update the background color based on the status
	        if (statusArray.includes(user.email)) {
	        	resultDiv.style.backgroundColor = "darkgreen"; // Current user selected
	        } else if (statusArray.length > 0) {
	        	resultDiv.style.backgroundColor = "lightgreen"; // At least one user selected
	        } else {
	        	resultDiv.style.backgroundColor = ""; // Default background
	        }
	
	        // Reset animation flag after animation completes
	        resultDiv.style.animation = "spin-grow 1s linear forwards";
	        resultDiv.addEventListener(
			"animationend",
			function () {
				resultDiv.style.animation = "";
				game.animating = false;
			},
			{ once: true }
		);
	};
}

function createOwnerHeaderClickHandler(ownerHeader, ownerDiv) {
    return function() {
        toggleOwnerGames(ownerDiv);
        ownerHeader.scrollIntoView({ behavior: 'smooth' });
    };
}

function updateGameInSheet(game, action) {
    const user = auth.currentUser;
    const selectedLibrary = game.owner;
    const url = `https://script.google.com/macros/s/AKfycbxlhxw69VE2Nx-_VaGzgRj1LcogTvmcfwjoQ0n9efEpDo0S1evEC1LlDZdQV8VjHdn-cQ/exec?library=${selectedLibrary}`;

    const payload = {
        action: "update",
        objectId: game.objectId,
        user: user.email,
        change: action, // "add" or "remove"
    };

    fetch(url, {
        method: "POST",
        mode: 'no-cors',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
    .then(() => {
        console.log(`Game status updated for ${game.name}: ${action}`);
    })
    .catch(error => {
        console.error("Error updating game status:", error);
    });
}

function sendToGoogleSheet(data) {
    var selectedLibrary = document.getElementById('libraryDropdown').value;
    const user = auth.currentUser;
    var url = `https://script.google.com/macros/s/AKfycbxlhxw69VE2Nx-_VaGzgRj1LcogTvmcfwjoQ0n9efEpDo0S1evEC1LlDZdQV8VjHdn-cQ/exec?library=${selectedLibrary}&email=${user.email}`;
    fetch(url, {
        method: 'POST',
        mode: 'no-cors', // As Google Apps Script does not support CORS
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => console.log('Data sent to Google Sheets'))
    .catch(error => console.error('Error:', error));
}

function removeFromGoogleSheet(objectId) {
    var selectedLibrary = document.getElementById('libraryDropdown').value;
    var url = `https://script.google.com/macros/s/AKfycbxlhxw69VE2Nx-_VaGzgRj1LcogTvmcfwjoQ0n9efEpDo0S1evEC1LlDZdQV8VjHdn-cQ/exec?library=${selectedLibrary}`;
    const payload = {
        action: 'remove',
        objectId: objectId
    };

    fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => console.log('Row removed'))
    .catch(error => console.error('Error:', error));
}

function populateLibraryDropdown() {
    const libraryDropdown = document.getElementById('libraryDropdown');
    libraryDropdown.length = 1; // Clear all options except the default one
    libraryDropdown.selectedIndex = 0;

    const user = auth.currentUser;
    if (!user) {
        // User is not logged in; show a message
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Please login to use this feature...";
        option.disabled = true;
        libraryDropdown.appendChild(option);
        hideLoadingOverlay();
        return;
    }

    showLoadingOverlay();

    const url = `https://script.google.com/macros/s/AKfycbxlhxw69VE2Nx-_VaGzgRj1LcogTvmcfwjoQ0n9efEpDo0S1evEC1LlDZdQV8VjHdn-cQ/exec?type=sheetNames&email=${user.email}`;
    fetch(url, {
        method: "GET",
        redirect: "follow", // Ensure redirects are followed
        headers: {
            "Content-Type": "text/plain;charset=utf-8", // Avoid preflight
        },
    })
        .then(response => response.text()) // Read response as text
        .then(text => {
            const sheetNames = JSON.parse(text); // Parse JSON manually
            if (sheetNames.error) {
                alert(sheetNames.error);
                hideLoadingOverlay();
                return;
            }

            // Keep the "Add New Library" option
            const addLibraryOption = document.createElement('option');
            addLibraryOption.value = "newLibrary";
            addLibraryOption.textContent = "Add New Library";

            libraryDropdown.length = 1; // Reset dropdown
            libraryDropdown.selectedIndex = 0;

            // Add valid sheet names, filtering out invalid options
            sheetNames
                .filter(name => name.trim() !== "") // Exclude empty names
                .filter(name => name.toLowerCase() !== "librarymetadata") // Exclude LibraryMetadata
                .sort((a, b) => a.localeCompare(b)) // Sort names alphabetically
                .forEach(name => {
                    const option = document.createElement('option');
                    option.value = name.toLowerCase();
                    option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
                    libraryDropdown.appendChild(option);
                });

            // Add the "Add New Library" option to the dropdown
            libraryDropdown.appendChild(addLibraryOption);

            hideLoadingOverlay();
        })
        .catch(error => {
            console.error("Error fetching sheet names:", error);
            alert("An error occurred while fetching library options.");
            hideLoadingOverlay();
        });
}

function handleLibraryChange() {
    var libraryDropdown = document.getElementById('libraryDropdown');
    var selectedValue = libraryDropdown.value;
    document.getElementById('libraryResults').innerHTML = '';

    if (selectedValue === 'newLibrary') {
        if (!isLoggedIn()) return;
        
        var newLibraryName = prompt("Please enter a name for the new library:");
        if (newLibraryName) {
            // Add the new library to the dropdown
            var newOption = document.createElement('option');
            newOption.value = newLibraryName.toLowerCase();
            newOption.textContent = newLibraryName.charAt(0).toUpperCase() + newLibraryName.slice(1);
            libraryDropdown.add(newOption, libraryDropdown.options[libraryDropdown.options.length - 1]);

            // Select the newly added library
            libraryDropdown.value = newLibraryName.toLowerCase();
        } else {
            // Reset the selection if the user cancels or enters no name
            libraryDropdown.value = '';
        }
    }
}

function showLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'block';
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'none';
}
