This project is a single-page application built using Vue.js framework, Nominatim and Leaflet APIs, as well as a custom API and SQLite3 database that allows users to view reported crimes within the neighborhoods in the St. Paul, Minnesota city limits. The page also allows for users to search for addresses or latitude and longitude and directly search the database through a number of different filters including dates, crime type, neighborhood, and more.

## Table of Contents

    Installation
    Features
    Demo
    APIs Used
    About the Team
    Findings

## Installation

To get started, clone the repository and install the necessary dependencies by running the following command in your terminal:

    npm install

Once the dependencies are installed, start the development server by running:

    node main.js

## Features

The following features are included in this project:

    View reported crimes within neighborhoods in St. Paul, MN city limits.
    Search for addresses or latitude and longitude.
    Directly search the database through various filters including dates, crime type, and neighborhood.
    Delete entries from the database.
    Add entries back to the database using a form submission.

## Demo

To see a live demo of this project, check out the following YouTube video:

https://youtu.be/8uH5dUh00sc

## APIs Used

The following APIs were used in this project:

    Nominatim API - for geocoding and reverse geocoding.
    Leaflet API - for displaying the map and markers.
    Custom API - for sending retrieving data from the SQLite3 database.

## About the Team

## This project was developed by a team of developers including:

    Ryan Thompson
    Mackenzie McClellan
    Cole Carlson

## Findings

Throughout the development of this project, our team found that utilizing the Vue.js framework allowed for efficient and organized development when it came to dynamically adjusting elements of our web page. Additionally, we found that utilizing APIs such as Nominatim and Leaflet allowed for a seamless integration of mapping and geocoding functionality, albeit with a bit of a learning curve. Finally, we found that utilizing SQLite3 as our database management system allowed for easy data manipulation and management.

Within St. Paul, there is a significant difference in incidents from central St. Paul compared to east/west. Although more populated, central St. Paul holds a considerably higher number of incidents overall. In some areas, triple the amount. Out of all incident types; Theft & Other crimes seem to be the most common incidents, as other groups in indicents such as proactive foot patrol. Downtown St. Paul has the highest number of incidents, with Proactive Police Visit being their most common. Dayton's Bluff had the largest record for homicide among all neighborhoods. The University of St. Thomas' address, 2115 Summit Ave, does not appear in the database in response to any crimes. 

