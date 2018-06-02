app.controller('mainCtrl', ['$scope', 'tm1Service', 'varService', '$mdDialog', 'tm1ProcessorService', 'xlExport', function ($scope, tm1Service, varService, $mdDialog, tm1ProcessorService, xlExport) {

    var electron = require('electron');
    var fs = require('fs');
    var ipc = electron.ipcRenderer;
    var dialog = electron.remote.dialog;
    $scope.TILogs = [];
    $scope.logRef = 0;

    $scope.saveDialog = function () {

    };


    ipc.on('showNav', function () {
        $scope.navOpen = !$scope.navOpen;
        $scope.$apply();
    });

    ipc.on('tiConsole', function () {
        $scope.showConsole = !$scope.showConsole;
        $scope.$apply();
    });

    ipc.on('connect', function () {
        $scope.login();

    });

    ipc.on('settings', function () {
        $scope.openSettings();
        //$scope.$apply();
    });

    ipc.on('controlObjects', function () {
        $scope.controlObjects = !$scope.controlObjects;
        for (var i = 0; i < $scope.cubes.length; i++) {
            if ($scope.cubes[i].Name.substring(0, 1) == '}') {
                $scope.cubes[i].expand = false;
            }
        }
        $scope.$apply();
    });

    ipc.on('logout', function () {
        $scope.logout();
        //$scope.$apply();
    });

    ipc.on('editor', function () {
        $scope.editorHide = !$scope.editorHide;
        $scope.$apply();
    });

    ipc.on('about', function () {
        $scope.openAbout();
    });


    ipc.on('tm1Slice', function () {
        $scope.tm1Export(true);
    });

    ipc.on('tm1Snapshot', function () {
        $scope.tm1Export(false);
    });


    $scope.consoleInput = function (e, tiCode) {
        //enter
        if (e.keyCode == 13) {
            if (tiCode && tiCode != '') {
                $scope.executeTI(tiCode);
            }

            //up    
        } else if (e.keyCode == 38) {
            //console.log($scope.logRef)
            //console.log($scope.TILogs.length)
            $scope.tiCode = $scope.TILogs[$scope.TILogs.length - $scope.logRef].function;

            if ($scope.logRef === 1) {
                $scope.logRef = $scope.TILogs.length;
            } else {
                $scope.logRef--;
            }
        }
        //down
        else if (e.keyCode == 40) {
            if ($scope.logRef === $scope.TILogs.length) {
                $scope.logRef = 1;
            } else {
                $scope.logRef++;
            }
            //console.log($scope.logRef)
            //console.log($scope.TILogs.length)
            $scope.tiCode = $scope.TILogs[$scope.TILogs.length - $scope.logRef].function;
        }

    };

    $scope.executeTI = function (code) {
        code = code.trim();
        if (code === 'cls') {
            $scope.TILogs = [];
            $scope.tiCode = '';
            $scope.logRef = 0;
        } else {

            tm1Service.executeTI($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL, code, 'compile').then(function (r) {

                if (r.data.value.length > 0) {
                    var tiObj = {
                        function: code,
                        success: false,
                    };

                    tiObj.msg = r.data.value[0].Message;

                    $scope.TILogs.unshift(tiObj);
                    $scope.logRef = $scope.TILogs.length;
                } else {
                    tm1Service.executeTI($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL, code, 'execute').then(function (r) {
                        var tiObj = {
                            function: code,
                            success: true,
                            msg: false
                        };

                        $scope.TILogs.unshift(tiObj);
                        $scope.logRef = $scope.TILogs.length;
                        tm1Service.getCubes($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL).then(function (d) {
                            $scope.cubes = d.data.value;
                        });
                    }, function (err) {
                        var tiObj = {
                            function: code,
                            success: false
                        };
                        if (err.data.error.hasOwnProperty('details')) {
                            tiObj.msg = err.data.error.details.ProcessError;
                        } else {
                            tiObj.msg = err.data.error.message;
                        }
                        var remove = 'Prolog procedure line (1):';
                        if (tiObj.msg.includes(remove)) {
                            tiObj.msg = tiObj.msg.replace(remove, '');
                        }

                        $scope.TILogs.unshift(tiObj);
                        $scope.logRef = $scope.TILogs.length;
                    });
                }




            }, function (err) {
                console.log(err);

                var tiObj = {
                    function: code,
                    success: false,
                };

                tiObj.msg = 'TM1 Version not supported. Upgrade to v11+.'

                $scope.TILogs.unshift(tiObj);
                $scope.logRef = $scope.TILogs.length;
            });

            $scope.tiCode = '';
        }


    };


    $scope.tm1Export = function (slice) {
        var wb = {};
        var ws;
        var sheetName = 'TM1Export';

        if (slice) {
            ws = xlExport.tm1Slice($scope.instanceToUse.Name, $scope.cellSet);
        } else {
            ws = xlExport.tm1Snapshot($scope.cellSet);
        }

        wb.SheetNames = [];
        wb.SheetNames.push(sheetName);
        wb.Sheets = {};
        wb.Sheets[sheetName] = ws;

        var wbout = XLSX.write(wb, {
            bookType: 'xlsx',
            bookSST: true,
            type: 'binary'
        });

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        var blob = new Blob([s2ab(wbout)], {
            type: "application/octet-stream"
        });



        dialog.showSaveDialog({
            filters: [
                {
                    name: 'Excel',
                    extensions: ['xlsx']
                }
            ]
        }, function (fileName) {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                fs.writeFile(fileName, Buffer.from(new Uint8Array(this.result)), function (err) {
                    if (err) {
                        alert(err.message);
                    }
                });
            };
            fileReader.readAsArrayBuffer(blob);
        });


    };


    $scope.setDragginObject = function (obj) {
        varService.draggingObject = obj;
    };


    $scope.findTm1 = function (ip) {
        $scope.tm1Instances = undefined;
        tm1Service.getInstances(ip).then(function (d) {
            $scope.tm1Instances = d.data.value;
            //console.log(d)
        }, function (error) {
            console.log(error)
            $scope.errorMessage = error;
        });
    };

    $scope.findTm1(varService.settings.server);


    $scope.$watch('tm1Instances', function () {
        if ($scope.tm1Instances)
            for (var i = 0; i < $scope.tm1Instances.length; i++) {
                if ($scope.tm1Instances[i].HTTPPortNumber > 0) {
                    $scope.instanceToUse = $scope.tm1Instances[i];
                    break;
                }
            }

    });

    $scope.logout = function () {
        tm1Service.logout($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.UsingSSL, $scope.instanceToUse.passcode).then(function (s) {
            $scope.instanceToUse.loggedIn = false;
            ipc.send('auth-logout-success', $scope.instanceToUse);
            console.log(s);
        })
    };

    $scope.login = function (user, password, namespace) {
        if (namespace) {
            var pass = 'CAMNamespace ' + btoa(user + ':' + (password || '') + ':' + namespace);
        } else {
            var pass = 'Basic ' + btoa(user + ':' + (password || ''));
        }

        console.log('PASS:%o', pass);

        $scope.instanceToUse.passcode = pass;
        //console.log($scope.instanceToUse)
        tm1Service.login($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, pass, $scope.instanceToUse.UsingSSL).then(function (d) {
            $scope.instanceToUse.loggedIn = true;
            //console.log(d);
            ipc.send('auth-login-success', $scope.instanceToUse);
            $scope.cubes = d.data.value;
            $mdDialog.cancel();
        }, function (err) {
            console.log(err);
            $scope.instanceToUse.loggedIn = false;
        });
    };


    $scope.createAttrCube = function () {
        tm1Service.createAttrCube($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL, $scope.dimToQuery).then(function (s) {
            tm1Service.getCubes($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL).then(function (d) {
                $scope.cubes = d.data.value;
            });
            alert('Attribute cube created');
            $scope.infoMessage = undefined;
        }, function (err) {
            console.log(err)
            alert('Error happened trying to create an attribute cube');
        });
    };


    $scope.executeMdx = function () {
        $scope.cellSet = undefined;
        $scope.dimensionElementsResults = [];
        $scope.executeMdxErr = undefined;
        $scope.infoMessage = undefined;
        $scope.cubeQueryResults = undefined;
        $scope.dimQueryResults = undefined;

        var selection = editor.getSelectedText();
        var code = editor.getValue();
        var query = selection == '' ? code : selection;

        //check what is selected
        //if selection starts with 'with' or 'select' execute mdx against cube
        //otherwise execute MDX against element attribute of the dimension, which needs to be picked up from the string

        if (query.toLowerCase().trim().startsWith('with') || query.toLowerCase().trim().startsWith('select')) {
            if ($scope.instanceToUse.loggedIn) {
                mdxQ(query);
            } else {
                //$scope.login();
                mdxQ(query);
            }
        } else {

            var dimToQuery = query.substring(query.search(/\[/) + 1, query.search(/\]/));
            $scope.dimToQuery = dimToQuery;
            var dimAttrCube = '}ElementAttributes_' + dimToQuery;

            tm1Service.getDimensionAttributes($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL, dimToQuery).then(function (data) {
                console.log(data)
                if (data.data.value.length === 0) {
                    console.log('No attributes cube exists. Create one?');
                    $scope.dimQueryResults = true;
                    $scope.infoMessage = true;

                } else {
                    mdxDim(query, dimAttrCube);
                }
            }, function (err) {
                $scope.executeMdxErr = err;
                $scope.dimQueryResults = true;
                console.log(err);
            });

        }


        function mdxDim(query, cube) {
            var queryDim = 'select ' + query + ' on 0 from [' + cube + ']';

            $scope.dimQueryResults = true;
            console.log('doing query against dimension (' + dimAttrCube + ')');
            console.log(queryDim)
            tm1Service.executeMdxDim($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL, queryDim).then(function (data) {
                console.log(data);
                $scope.dimensionElementsResults = data.data.Axes[0].Tuples;
            }, function (err) {
                console.log(err);
                $scope.executeMdxErr = err;
            });
        }


        function mdxQ(query) {
            $scope.cubeQueryResults = true;
            $scope.dimQueryResults = false;
            //var selection = editor.getSelectedText();
            //var code = editor.getValue();
            //var query = selection == '' ? code : selection;
            $scope.table = {};
            $scope.timeStart = new Date();

            tm1Service.executeMdx($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL, query).then(function (d) {

                ipc.send('export-enable', true);

                $scope.timeResultsReceived = new Date();
                $scope.timeToExecute = $scope.timeResultsReceived - $scope.timeStart;

                var previous;
                var count = 1;

                $scope.cellSet = d.data;
                console.log($scope.cellSet);

                //delete cellset from tm1
                tm1Service.deleteCellSet($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL, $scope.cellSet.ID).then(function (s) {
                    console.log('deleted. %o', s);
                })

                //filters

                $scope.table.dimensions = {
                    filters: [],
                    rows: [],
                    columns: []
                };



                for (var i = 0; i < $scope.cellSet.Axes[0].Hierarchies.length; i++) {
                    $scope.table.dimensions.columns.push({
                        dim: $scope.cellSet.Axes[0].Hierarchies[i].Name
                    });
                }

                if ($scope.cellSet.Axes.length >= 2) {
                    for (var i = 0; i < $scope.cellSet.Axes[1].Hierarchies.length; i++) {
                        $scope.table.dimensions.rows.push({
                            dim: $scope.cellSet.Axes[1].Hierarchies[i].Name
                        });

                    }
                }

                if ($scope.cellSet.Axes.length === 3) {
                    for (var i = 0; i < $scope.cellSet.Axes[2].Hierarchies.length; i++) {
                        $scope.table.dimensions.filters.push({
                            dim: $scope.cellSet.Axes[2].Hierarchies[i].Name,
                            el: $scope.cellSet.Axes[2].Tuples[0].Members[i].Name
                        });
                    }
                }


                var numberColumns = $scope.cellSet.Axes[0].Cardinality;
                $scope.table.cellSetTableHeaders = [];
                //headers
                for (var j = 0; j < $scope.cellSet.Axes[0].Hierarchies.length; j++) {
                    $scope.table.cellSetTableHeaders.push([]);

                    for (var i = 0; i < $scope.cellSet.Axes[1].Hierarchies.length; i++) {
                        $scope.table.cellSetTableHeaders[j].push('');
                    }


                    for (var i = 0; i < numberColumns; i++) {
                        if ($scope.cellSet.Axes[0].Tuples[i].Members[j].Name === previous) {
                            //$scope.table.cellSetTableHeaders[j].push('');
                            count = count + 1;

                            $scope.table.cellSetTableHeaders[j][$scope.table.cellSetTableHeaders[j].length - 1].span = count;

                        } else {
                            count = 1;
                            $scope.table.cellSetTableHeaders[j].push({
                                name: $scope.cellSet.Axes[0].Tuples[i].Members[j].Name,
                                span: 1
                            });
                        }
                        previous = $scope.cellSet.Axes[0].Tuples[i].Members[j].Name;
                    }
                }



                //body
                $scope.table.cellSetTable = [];
                for (var i = 0; i < $scope.cellSet.Cells.length; i++) {
                    if (i % numberColumns === 0) {
                        $scope.table.cellSetTable.push([]);

                    }

                    $scope.table.cellSetTable[$scope.table.cellSetTable.length - 1].push($scope.cellSet.Cells[i].FormattedValue)

                }

                //table row headers
                $scope.table.cellSetTableRowHeaders = [];
                for (var i = 0; i < $scope.cellSet.Axes[1].Cardinality; i++) {
                    $scope.table.cellSetTableRowHeaders.push([]);
                    for (var j = 0; j < $scope.cellSet.Axes[1].Hierarchies.length; j++) {

                        if ($scope.cellSet.Axes[1].Tuples[i].Members[j].Name) {}

                        $scope.table.cellSetTableRowHeaders[i].push({
                            name: $scope.cellSet.Axes[1].Tuples[i].Members[j].Name,
                            span: 1
                        })
                    }

                }

            }, function (err) {
                $scope.timeResultsReceived = new Date();
                $scope.timeToExecute = $scope.timeResultsReceived - $scope.timeStart;
                $scope.executeMdxErr = err;
                console.log(err);
            });
        }
    };


    $scope.getElements = function (dim, hierarchy) {
        tm1Service.getElements($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL, dim.Name, hierarchy.Name).then(function (d) {
            //console.log(tm1ProcessorService.processDimensionElements(d.data.value))
            hierarchy.elements = tm1ProcessorService.processDimensionElements(d.data.value);
            hierarchy.flatElements = d.data.value;
        }, function (err) {
            console.log(err)
        });
    };


    $scope.getHierarchies = function (dim) {
        tm1Service.getHierarchies($scope.instanceToUse.IPAddress, $scope.instanceToUse.HTTPPortNumber, $scope.instanceToUse.passcode, $scope.instanceToUse.UsingSSL, dim.Name).then(function (d) {

            dim.hierarchies = d.data.value;

        }, function (err) {
            console.log(err)
        });
    };


    //ace
    var editor = ace.edit("aceEditor");
    editor.setShowPrintMargin(false);
    editor.setOptions({
        wrap: true,
        indentedSoftWrap: false,
        enableBasicAutocompletion: true,
        fontSize: '10pt'
    });

    editor.getSession().setMode("ace/mode/sql");
    editor.$blockScrolling = Infinity;


    var scope = $scope;
    //settings dialog

    $scope.openSettings = function (ev) {
        $mdDialog.show({
                controller: OpenSettingsController,
                templateUrl: 'settings-dialog.html',
                parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false
                //fullscreen: true
            })
            .then(function (answer) {

            }, function () {

            });
    };


    function OpenSettingsController($scope, $mdDialog, varService) {

        $scope.findTm1 = scope.findTm1;
        scope.$watch('tm1Instances', function () {
            $scope.tm1Instances = scope.tm1Instances;
        }, true);

        $scope.server = varService.settings.server;
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
    }



    //about dialog
    $scope.openAbout = function (ev) {
        $mdDialog.show({
                controller: OpenAboutController,
                templateUrl: 'about-dialog.html',
                parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false
                //fullscreen: true
            })
            .then(function (answer) {

            }, function () {

            });
    };

    function OpenAboutController($scope, $mdDialog, varService) {
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
    }



    //login dialog
    $scope.loginPopup = function (ev) {
        $mdDialog.show({
                controller: LoginPopupController,
                templateUrl: 'login-dialog.html',
                parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false
                //fullscreen: true
            })
            .then(function (answer) {

            }, function () {

            });
    };

    function LoginPopupController($scope) {
        $scope.login = scope.login;


        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };


    }


    $scope.$on('auth-call', function () {
        $scope.loginPopup();
    });







}]);
