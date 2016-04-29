angular.module('starter.mainControllers', ['connexionHelper'])
    .constant('config', {
        // apiUrl: 'http://85.31.218.130/contact-bo/api',
        apiUrl: 'http://localhost:8100/api',
        enableDebug: false
    })
    .controller('AppCtrl', function($scope, $location, $ionicPopup,
        $ionicHistory, $localStorage, $sessionStorage,
        $http, ConnectivityMonitor, config) {

        $scope.sync_data = false;
        $scope.contact = {
            firstname: '',
            lastname: '',
            email: '',
            phone: '',
            birthday: ''
        };

        if ($localStorage.contacts !== undefined && $localStorage.contacts.length) {
            $scope.sync_data = true;
        }

        $scope.register = function(formContact) {
            
            if(formContact.$valid) {              
                $scope.saveContact($scope.contact, function() {
                    $ionicPopup.alert({
                        title: 'Données enregistrées',
                        template: ''
                    });
                });                
            }

            // //TODO : 
            // if ($localStorage.contacts !== undefined && $localStorage.contacts.length && false) {
            //     $scope.syncData();
            // }
        };

        //TODO : séparer en deux fonctions
        $scope.saveContact = function(contact, cb) {
            $http.post(config.apiUrl + '/contacts', contact).then(
                (function(contact) {
                    return function(data) {
                        //connexion OK
                        $scope.reset();
                        cb();
                        //TOCO : 
                        if ($localStorage.contacts !== undefined && !$localStorage.contacts.length) {
                            $scope.sync_data = false;
                        }
                    }
                })(contact), (function(contact) {
                    return function(data) {
                        //connexion KO
                        $scope.saveLocally($scope.contact);
                        $scope.reset();
                        cb();
                    }
                })(contact)
            );
        };

        $scope.syncContact = function(contact, index) {
            $http.post(config.apiUrl + '/contacts', contact).then(
                (function(contact, index) {
                    return function(data) {
                        //connexion OK
                        if (index >= 0) {
                            $localStorage.contacts.splice(0, 1);
                        } else {
                            $scope.reset();
                        }

                        if ($localStorage.contacts !== undefined && !$localStorage.contacts.length) {
                            $scope.sync_data = false;
                        }
                    }
                })(contact, index), (function(contact, index) {
                    return function(data) {
                        //connexion KO
                        if (index < 0) {
                            $scope.saveLocally($scope.contact);
                            $scope.reset();
                        } else {
                            //
                        }
                    }
                })(contact, index)
            );
        };

        $scope.saveLocally = function(contact) {
            var contacts = [];
            // Read
            var contact = $localStorage.contacts;
            if ($localStorage.contacts !== undefined) {
                if (contact instanceof Array == false) {
                    contacts.push(contact);
                } else {
                    contacts = contact;
                }
            }
            contacts.push($scope.contact);

            $localStorage.contacts = contacts;
            $scope.sync_data = true;
        };

        //init contact form
        $scope.reset = function() {
            $scope.contact = {
                firstname: '',
                lastname: '',
                email: '',
                phone: '',
                birthday: ''
            };
        };

        $scope.syncData = function() {

            //à refaire
            for (var i = 0; i < $localStorage.contacts.length; i++) {
                $scope.saveContact($localStorage.contacts[i], i);
            }

        };

        $scope.fillForm = function() {
            $scope.contact = {
                firstname: faker.name.firstName(),
                lastname: faker.name.lastName(),
                email: faker.internet.email(),
                phone: faker.phone.phoneNumber(),
                birthday: faker.date.past(50, new Date("Sat Sep 20 1992 21:35:02 GMT+0200 (CEST)"))
            };
        }
    });