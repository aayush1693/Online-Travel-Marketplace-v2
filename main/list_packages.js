window.addEventListener('DOMContentLoaded', (event) => {
    const tableBody = document.getElementById('packagesTable').querySelector('tbody');

    // Fetch the packages from the server
    fetch('/api/packages1')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(packages => {
            // Insert the packages into the table
            packages.forEach(package => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${package.name}</td>
                    <td>${package.description}</td>
                    <td>${package.price}</td>
                    <td><img src="/uploads/${package.image}" alt="${package.name}"></td>
                    <td>
                        <button class="editButton" data-id="${package.id}">Edit</button>
                        <button class="deleteButton" data-id="${package.id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    // Add event listeners to the edit and delete buttons[^1^][1]
document.querySelectorAll('.editButton').forEach(button => {
    button.addEventListener('click', (event) => {
        const packageId = event.target.dataset.id;
        // Collect the new package data from the user
        const newName = prompt('Enter the new name for the package:');
        const newDescription = prompt('Enter the new description for the package:');
        const newPrice = prompt('Enter the new price for the package:');


        // Send a POST request to the /api/edit_package endpoint
        fetch(`/api/edit_package/${packageId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: newName,
                description: newDescription,
                price: newPrice
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the package row in the table
                const row = event.target.closest('tr');
                row.cells[0].textContent = newName;
                row.cells[1].textContent = newDescription;
                row.cells[2].textContent = newPrice;
            } else {
                // Handle error
                alert(data.message);
            }
        });
    });
});

document.querySelectorAll('.deleteButton').forEach(button => {
    button.addEventListener('click', (event) => {
        const packageId = event.target.dataset.id;
        // Send a DELETE request to the /api/delete_package endpoint
        fetch(`/api/delete_package/${packageId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Remove the package row from the table
                event.target.closest('tr').remove();
            } else {
                // Handle error
                alert(data.message);
            }
        });
    });
});

});


