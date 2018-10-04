var app = angular.module('app', ['ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.selection']);

app.controller('MainCtrl', ['$scope', '$http', 'uiGridConstants', function ($scope, $http, uiGridConstants) {

    $scope.highlightFilteredHeader = function( row, rowRenderIndex, col, colRenderIndex ) {
        if( col.filters[0].term ){
            return 'header-filtered';
        } else {
            return '';
        }
    };

    $scope.gridOptions = {
        enableFiltering: true,
        enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
        columnDefs: [
            {field: 'firstName'},
            {field: 'lastName'},
            {field: 'email', filterHeaderTemplate: '<div class="ui-grid-filter-container" ng-repeat="colFilter in col.filters"><div my-custom-modal></div></div>', headerCellClass: $scope.highlightFilteredHeader}
        ]
    };

    $scope.gridOptions.data = [
        {
            firstName: "Cox",
            lastName: "Carney",
            email: "cox.carney@gmail.com"
        },
        {
            firstName: "Lorraine",
            lastName: "Wise",
            email: "lorraine.wise@gmail.com"
        },
        {
            firstName: "Nancy",
            lastName: "Waters",
            email: "nancy.waters@gmail.com"
        }
    ];

}]).directive('myCustomModal', function() {
    return {
        template: '<button class="btn btn-xs btn-info" ng-click="showEmailsModal()">Filtrer e-mail&nbsp<span class="glyphicon glyphicon-filter" aria-hidden="true"></span></button>',
        controller: 'myCustomModalCtrl'
    };
}).controller('myCustomModalCtrl', function( $scope, $compile, $timeout ) {
    var $elm;

    $scope.showEmailsModal = function() {
        $scope.listOfEmails = [];

        $scope.col.grid.appScope.gridOptions.data.forEach( function ( row ) {
            if ( $scope.listOfEmails.indexOf( row.email ) === -1 ) {
                $scope.listOfEmails.push( row.email );
            }
        });
        $scope.listOfEmails.sort();

        $scope.gridOptions = {
            data: [],
            enableColumnMenus: false,
            onRegisterApi: function( gridApi) {
                $scope.gridApi = gridApi;

                if ( $scope.colFilter && $scope.colFilter.listTerm ){
                    $timeout(function() {
                        $scope.colFilter.listTerm.forEach( function( email ) {
                            var entities = $scope.gridOptions.data.filter( function( row ) {
                                return row.email === email;
                            });

                            if( entities.length > 0 ) {
                                $scope.gridApi.selection.selectRow(entities[0]);
                            }
                        });
                    });
                }
            }
        };

        $scope.listOfEmails.forEach(function( email ) {
            $scope.gridOptions.data.push({email: email});
        });

        var html = '<div class="modal" ng-style="{display: \'block\'}"><div class="modal-dialog"><div class="modal-content"><div class="modal-header">Filter Emails</div><div class="modal-body"><div id="grid1" ui-grid="gridOptions" ui-grid-selection class="modalGrid"></div></div><div class="modal-footer"><button id="buttonClose" class="btn btn-primary" ng-click="close()">Filter</button></div></div></div></div>';
        $elm = angular.element(html);
        angular.element(document.body).prepend($elm);

        $compile($elm)($scope);

    };

    $scope.close = function() {
        var ages = $scope.gridApi.selection.getSelectedRows();
        $scope.colFilter.listTerm = [];

        ages.forEach( function( email ) {
            $scope.colFilter.listTerm.push( email.email );
        });

        $scope.colFilter.term = $scope.colFilter.listTerm.join(', ');
        $scope.colFilter.condition = new RegExp($scope.colFilter.listTerm.join('|'));

        if ($elm) {
            $elm.remove();
        }
    };
});

