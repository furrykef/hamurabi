Hamurabi = {};
(function () {
"use strict";

// view model
function ViewModel() {
    this.year = ko.observable(0),
    this.born = ko.observable(0),
    this.starved = ko.observable(0),
    this.plague = ko.observable(false),
    this.farmed = ko.observable(0),
    this.harvest_per_acre = ko.observable(0),
    this.rats = ko.observable(0),
    this.store = ko.observable(0),
    this.population = ko.observable(0),
    this.acres = ko.observable(0),
    this.acre_price = ko.observable(0),
    this.in_acres = ko.observable(0),
    this.in_food = ko.observable(0),
    this.in_farmed = ko.observable(0),
    this.total_harvest = ko.computed(function () {
        return this.harvest_per_acre() * this.acres();
    }, this),
    this.acre_sales = ko.computed(function () {
        return (this.acres() - this.in_acres()) * this.acre_price();
    }, this)
}

var vm = new ViewModel();

Hamurabi.newGame = function () {
    vm.year(0);
    vm.born(5);
    vm.starved(0);
    vm.plague(false);
    vm.farmed(950);
    vm.harvest_per_acre(3);
    vm.rats(200);
    vm.store(2800);
    vm.population(100);
    vm.acres(1000);
    vm.acre_price(randInt(17, 26));
    vm.in_acres(1000);
    vm.in_food(2000);
    vm.in_farmed(0);
};

// Input is assumed to be valid
Hamurabi.onSubmit = function () {
    vm.year(vm.year() + 1);
    vm.farmed(vm.in_farmed());

    vm.acres(vm.in_acres());
    vm.store(vm.store() + vm.acre_sales());

    vm.acre_price(randInt(17, 26));

    // A bountiful harvest! (Hopefully.)
    vm.harvest_per_acre(randInt(1, 5));

    // Rats are running wild! (Maybe.)
    vm.rats(0);
    var tmp = randInt(1, 5);
    if (tmp % 2 == 0) {
        vm.rats(Math.floor(vm.store() / tmp));
    }

    vm.store(vm.store() + vm.total_harvest() - vm.rats());

    // Let's have some babies. (Bow chicka wow wow.)
    vm.born(Math.floor(randInt(1, 5)*(20*vm.acres()+vm.store())/vm.population()/100+1));

    // Horrors, a 15% chance of plague!
    vm.plague(Math.random() <= 0.15);
    if (vm.plague()) {
        vm.population(Math.floor(vm.population() / 2));
    }

    vm.starved(Math.max(vm.population() - Math.floor(vm.in_food()/20), 0));
    var starvation_threshold = vm.population()*0.45;

    vm.population(vm.population() + vm.born() - vm.starved());

    // Starved enough for impeachment?
    if (vm.starved() > starvation_threshold) {
        endGameStarvation();
    }
};

Hamurabi.plus = function (num) {
    return ((num < 0) ? '' : '+') + num
};

function endGameStarvation() {
    alert("Too many citizens starved! Game over.");
}

// range is inclusive
function randInt(low, high) {
    return Math.floor(Math.random()*(high - low + 1)) + low;
}

ko.applyBindings(vm);
Hamurabi.newGame();

}());
