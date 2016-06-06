Hamurabi = {};
(function () {
"use strict";

ko.components.register('myslider', {
    viewModel: function(params) {
        this.v = params.v;
        this.step = params.step;
    },
    template:
        '<button data-bind="click: v(Math.max(v() - step, 0))">-</button>\
         <input type="range"\
                data-bind="value: v,\
                           valueUpdate: \'input\',\
                           attr: {step: step}"\
                min="0"\
                max="3000">\
         <button data-bind="click: v(v() + step)">+</button>'
});

// Based on sample code at http://knockoutjs.com/documentation/extenders.html
// This seems clunky. Is there a better way?
ko.extenders.integer = function (target) {
    var result = ko.pureComputed({
        read: target,
        write: function (new_value) {
            new_value = Math.floor(new_value);
            if (new_value !== target()) {
                target(new_value);
            }
        }
    });

    result(target());

    return result;
};

function ViewModel() {
    var self = this;
    self.year = ko.observable(0);
    self.born = ko.observable(0);
    self.starved = ko.observable(0);
    self.total_starved = ko.observable(0);
    self.avg_starved_pct = ko.observable(0);
    self.too_many_starved = ko.observable(false);
    self.plague = ko.observable(false);
    self.farmed = ko.observable(0);
    self.harvest_per_acre = ko.observable(0);
    self.rats = ko.observable(0);
    self.store = ko.observable(0);
    self.population = ko.observable(0);
    self.acres = ko.observable(0);
    self.acres_per_person = ko.computed(function () {
        return self.acres() / self.population();
    });
    self.acre_price = ko.observable(0);
    self.in_acres = ko.observable(0).extend({integer: null});
    self.in_food = ko.observable(0).extend({integer: null});
    self.in_farmed = ko.observable(0).extend({integer: null});
    self.total_harvest = ko.computed(function () {
        return self.harvest_per_acre() * self.acres();
    });
    self.acre_sales = ko.computed(function () {
        return (self.acres() - self.in_acres()) * self.acre_price();
    });
    // 'ingame' for in-game
    // 'end0' for bad ending
    // 'end1' for less bad ending
    // 'end2' for OK ending
    // 'end3' for good ending
    self.status = ko.observable('');
}

var vm = new ViewModel();

Hamurabi.newGame = function () {
    vm.year(0);
    vm.born(5);
    vm.starved(0);
    vm.total_starved(0);
    vm.avg_starved_pct(0);
    vm.too_many_starved(false);
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
    vm.status('ingame');
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
    vm.total_starved(vm.total_starved() + vm.starved());

    var starved_pct = vm.starved()/vm.population()*100;
    vm.avg_starved_pct(((vm.year() - 1)*vm.avg_starved_pct() + starved_pct)/vm.year());

    vm.population(vm.population() + vm.born() - vm.starved());

    // Starved enough for impeachment?
    if (vm.starved() > starvation_threshold) {
        vm.too_many_starved(true);
        vm.status('end0');
    } else if (vm.year() == 10) {
        // Game's over. Let's tell the player how he did
        if (vm.avg_starved_pct() > 33 || vm.acres_per_person() < 7) {
            vm.status('end0');
        } else if (vm.avg_starved_pct() > 10 || vm.acres_per_person() < 9) {
            vm.status('end1');
        } else if (vm.avg_starved_pct() > 3 || vm.acres_per_person() < 10) {
            vm.status('end2');
        } else {
            vm.status('end3');
        }
    }
};

Hamurabi.plus = function (num) {
    return ((num < 0) ? '' : '+') + num
};

// range is inclusive
function randInt(low, high) {
    return Math.floor(Math.random()*(high - low + 1)) + low;
}

ko.applyBindings(vm);
Hamurabi.newGame();

}());
