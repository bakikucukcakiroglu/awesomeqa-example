#!/bin/bash

mongoimport --host mongodb --db awesomedb --collection tickets --type json --file /mongo-seed/data/tickets.json --jsonArray
mongoimport --host mongodb --db awesomedb --collection messages --type json --file /mongo-seed/data/messages.json --jsonArray

echo "Data import completed."
