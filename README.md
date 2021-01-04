This 'JavaScript Simulation Engine' represents the frontend to a Blockchain project called 'EV Charging'.

Aim
a number of Electric Vehicles (EV) is spawned on a map of Leuven (Belgium), and they all start driving randomly.
The EV's are created from a list of 12 currently existing brands (from a small 16.5kWh Smart ED to 90kWh Tesla S 85).
They all drive the daily average commute of 31.84 km, till they reach low battery: already at 30% they start looking for a charging point (an EVSE, or Electric Vehile Supply Equipment). After succesful reservation of an EVSE they head towards is, and charge till high battery (80%).
Each electricity charge session results in a 'Charge Detail Record' (CDR), which is next being sent to a Hyperledger Fabric blockchain.

The aim of the overall project is to show the added value of a tamperfree blockchain solution for accounting a vast amount of rather small 'micro payments' (typically around 5 to 10 €). 

