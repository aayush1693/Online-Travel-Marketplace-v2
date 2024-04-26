window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('package').addEventListener('change', function () {
        var selectedOptionText = this.options[this.selectedIndex].text;
        document.querySelector('input[name="package_id"]').value = selectedOptionText;
    });

    function fetchAndDisplayRating(packageId) {
        return fetch(`/api/package/rating/${encodeURIComponent(packageId)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.averageRating !== null && data.averageRating !== undefined) {
                    return data.averageRating;
                } else {
                    console.error(`No rating data for package ${packageId}`);
                    return '0.0';
                }
            })
            .catch(error => {
                console.error(`There was a problem with the fetch operation for package ${packageId}: `, error);
                return '0.0';
            });
    }

    fetch('/api/packages')
        .then(response => response.json())
        .then(packages => {
            const packagesDiv = document.getElementById('packages');

            function displayPackages(packages) {
                packagesDiv.innerHTML = '';
                packages.sort((a, b) => b.averageRating - a.averageRating);

                packages.forEach(package => {
                    const packageCard = document.createElement('div');
                    packageCard.className = 'package-card';
                    packageCard.innerHTML = `
                        <h2>${package.name}</h2>
                        <img src="/uploads/${package.image}" alt="${package.name}" >
                        <p>${package.description}</p>
                        <p>Price: ${package.price}</p>
                        <p>Provider: ${package.business_name}</p>
                        <div class="average-rating">Average Rating: ${parseFloat(package.averageRating).toFixed(1)}</div>
                        <form class="booking-form">
                            <input type="hidden" name="package" value="${package.name}">
                            <input type="hidden" name="business" value="${package.business_name}">
                            <button type="submit">Book</button>
                        </form>
                    `;
                    packagesDiv.appendChild(packageCard);

                    packageCard.querySelector('.booking-form').addEventListener('submit', (event) => {
                        event.preventDefault();

                        const formData = new FormData(event.target);
                        alert('Booking made successfully! Please check your email.');

                        fetch('/api/bookings', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(Object.fromEntries(formData))
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log(data);
                                if (data.success) {
                                    alert('Booking made successfully! Please check your email.');
                                }
                            })
                            .catch(error => console.error('Error:', error));
                    });
                });
            }

            Promise.all(packages.data.map(package => fetchAndDisplayRating(package.name)))
                .then(ratings => {
                    packages.data.forEach((package, index) => {
                        package.averageRating = ratings[index] !== '0.0' ? ratings[index] : 'No rating';
                    });
                    displayPackages(packages.data);
                });

            document.getElementById('search-form').addEventListener('submit', function (event) {
                event.preventDefault();

                const searchTerm = document.getElementById('search').value.toLowerCase();

                const filteredPackages = packages.data.filter(package =>
                    package.name.toLowerCase().includes(searchTerm) ||
                    package.description.toLowerCase().includes(searchTerm) ||
                    package.business_name.toLowerCase().includes(searchTerm)
                );

                displayPackages(filteredPackages);
            });

            const packageSelect = document.getElementById('package');
            packages.data.forEach(package => {
                const option = document.createElement('option');
                option.value = package.id;
                option.textContent = package.name;
                packageSelect.appendChild(option);
            });
        });

    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(reviewForm);
        const data = Object.fromEntries(formData);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/reviews', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                console.log(data);
                if (data.success) {
                    alert('Review made successfully! Thank you for sharing your review. Your review helps us improve.');
                }
            } else {
                console.error('Error:', xhr.statusText);
            }
        };
        xhr.onerror = function () {
            console.error('Request failed');
        };
        xhr.send(JSON.stringify(data));
    });
});
