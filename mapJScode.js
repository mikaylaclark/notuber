  var map;

                   function initMap() {
                        map = new google.maps.Map(document.getElementById("map"), {
                              center: {lat: 42.352271, lng: -71.05524200000001},
                              zoom: 8
                        });
                   myCoords();
                   }



                 //Need to separate and make more modular
                   function myCoords() {
                      var latitude;
                      var longitude;

                     //Finding user location
                      navigator.geolocation.getCurrentPosition(function(position) {
                         latitude = position.coords.latitude;
                         longitude = position.coords.longitude;

                     //Creating user marker on map
                        var myPos = new google.maps.Marker({
                                  position: new google.maps.LatLng(latitude, longitude),
                                  map: map,
                                  title: "Me"
                          });

                      //Trying to request JSON data
                       var request = new XMLHttpRequest();
                       var url = "https://stark-earth-13725.herokuapp.com/rides";
                       var params = "username=IZ1sLGwg&lat=" + latitude + "&lng=" + longitude;

                       request.open('POST', url, true);

                       request.setRequestHeader( "Content-type", "application/x-www-form-urlencoded");

                       request.onreadystatechange = function () {

                        //Looping through and creating markers and placing them on the map
                           if (request.readyState == 4 && request.status == 200) {
                               cars = JSON.parse(request.responseText);
                               for (var i = 0; i < cars.length; i++) {
                                   var carMarker = cars[i];
                                   var marker = new google.maps.Marker({
                                   position: new google.maps.LatLng(carMarker["lat"], carMarker["lng"]),
                                   map: map,
                                   title: carMarker["_id"],
                                   icon: "https://mikaylaclark.github.io/notuber/car.png"
                                   });
                               }

                           //Finding minimum car distance
                             var carCoords = findClosest(latitude, longitude, cars);
                             var userCoords = new google.maps.LatLng(latitude, longitude);

                             var minCarDist = google.maps.geometry.spherical.computeDistanceBetween(userCoords,
                                              carCoords);
                             var dist = meterToMile(minCarDist);

                           //Displaying the closest car
                             infowindow(dist, userCoords, myPos, map, carCoords);

                           }
                       };

                     //Sending
                       request.send(params);

                     });
                    }


                 //HELPER FUNCTIONS

                   function findClosest(userLat, userLng, carsInfo) {

                    var userCoords = new google.maps.LatLng(userLat, userLng);

                    var minCoords = [carsInfo[0]["lat"], carsInfo[0]["lng"]];
                    var minLatLng = new google.maps.LatLng(minCoords[0], minCoords[1]);
                    var minDist = google.maps.geometry.spherical.computeDistanceBetween(userCoords,
                                  minLatLng);
                    var minIndex = 0;
                        for (var i = 1; i < carsInfo.length; i++) {

                            var carCoords = [carsInfo[i]["lat"], carsInfo[i]["lng"]];
                            var carLatLng = new google.maps.LatLng(carCoords[0], carCoords[1]);
                            var carDist = google.maps.geometry.spherical.computeDistanceBetween(userCoords,
                                  carLatLng);

                            if (carDist < minDist) {
                               minDist = carDist;
                               minCoords = carCoords;
                               minLatLng = carLatLng;
                               minIndex = i;
                            }
                         }


                         return minLatLng;
                     }


                   function meterToMile(dist) {

                   return dist * 0.00062137;
                   }


                   function infowindow(distance, userLatLng, marker, map, carCoords, carIndex, carInfo) {

                            marker.addListener('click', function() {

                            var infowindow = new google.maps.InfoWindow({

                            content: '<p>The closest vehicle to you is: ' +
                                         distance + ' miles away.</p>'
                            });
                            infowindow.open(map, marker);
                            });

                          //Setting polyline
                           var newLine = new google.maps.Polyline({
                           path: [userLatLng, carCoords]
                           });

                           newLine.setMap(map);
                    }

