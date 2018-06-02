app.directive('dragMe', ['varService', function (varService) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            angular.element(element[0]).on('dragstart', function (e) {
                var insert;
                if (attrs.dragMe === 'cube') {
                    insert = '[' + varService.draggingObject + ']';
                } else if (attrs.dragMe === 'dimension') {
                    insert = '[' + varService.draggingObject + '].MEMBERS';
                } else if (attrs.dragMe === 'element') {
                    insert = '{' + varService.draggingObject + '}';
                }

                e.dataTransfer.setData("text", insert);
                console.log(element);

            });
        }
    };
}]);

app.directive('elementsTree', [function () {
    return {
        restrict: 'E',
        scope: {
            'listarray': '=',
            'setElementDrag':'&',
            'topFunc':'='
        },
        template: '<ul style="padding-left:20px; list-style:none;"><li ng-mousedown="setElementDrag({el:i.uniqueName})" drag-me="element" draggable="true" ng-repeat-start="i in listarray">{{i.name}}</li><li ng-repeat-end><elements-tree top-func="topFunc" set-element-drag="topFunc(el)" listarray="i.components"></elements-tree></li></ul>',
        link: function (scope, element, attrs) {
            //scope.$watch('listarray', function () {})

        }
    };

}]);



