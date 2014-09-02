/*global module */
/*jshint node:true */
var _ = require("underscore");

var specType = require("./specs/specType.json");
var specTypeProduct = require("./specs/specTypeProduct.json");

var validator = {
    hasEmptyObjects: function (obj) {
        try {
            if(_.isEmpty(obj)) { // Needed for check on root of object
                return true;
            }
            for(var key in obj) {
                if(obj.hasOwnProperty(key)) {
                    var val = obj[key];
                    if(typeof val === "object") {
                        if(_.isEmpty(val)) {
                            return true;
                        } else {
                            if(validator.hasEmptyObjects(val)) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        } catch(e) {
        }
    },
    findEmptyObjects: function (obj) {
        try {
            if(_.isEmpty(obj)) { // Needed for check on root of object
                return {_isEmpty: true};
            }
            var res = {};
            for(var key in obj) {
                if(obj.hasOwnProperty(key)) {
                    var val = obj[key];
                    if (typeof val === "object") {
                        if (_.isEmpty(val)) {
                            res[key] = {_isEmpty: true};
                        } else {
                            var sub = validator.findEmptyObjects(val);
                            if (!_.isEmpty(sub)) {
                                res[key] = sub;
                            }
                        }
                    }
                }
            }
            return res;
        } catch(e) {
        }
    },
    checkTypes: function (obj, spec) {
        try {
            var res = {};

            if(typeof spec._type === "undefined") {
                res._log = (res._log || []).push("'_type' key not found!");
                return res;
            }

            var _type = spec._type;
            if(_type === "ignore") {
                res._typeCheck = "ignored";
                res._log = (res._log || []).push("Key ignored when type checking.");
                return res;
            }
            if(_type === "product") {
                _.extend(spec, specTypeProduct);
                //spec = JSON.parse(JSON.stringify(spec));// Can be used if deep copy really is needed
                _type = spec._type;
            }

            res._typeExpected = _type;
            res._typeFound = typeof obj;
            if(_.isArray(obj)) {
                res._typeFound = "array";
            }

            if(res._typeExpected !== res._typeFound) {
                res._typeCheck = "failed";
                return res;
            }

            res._typeCheck = "passed";

            if(_type === "object") {
                for(var key in obj) {
                    if(obj.hasOwnProperty(key)) {
                        if(typeof spec[key] !== "undefined") {
                            res[key] = validator.checkTypes(obj[key], spec[key]);
                        } else {
                            res[key] = {_log: ["Key does not exist in spec."]};
                        }
                    }
                }
            }
            if(_type === "array") {
                if(typeof spec._entry !== "undefined") {
                    for(var i = 0; i < obj.length; i++) {
                        res[i] = validator.checkTypes(obj[i], spec._entry);
                    }
                } else {
                    res._log = (res._log || []).push("'_entry' key not found!");
                }
            }

            return res;
        } catch(e) {
        }
    },
    findMissingObjects: function (obj, spec) {
        try {
            var res = {}, sub;

            if(typeof spec._type === "undefined") {
                return res;
            }

            if(spec._type === "product") {
                _.extend(spec, specTypeProduct);
                //spec = JSON.parse(JSON.stringify(spec));// Can be used if deep copy really is needed
            }

            if(_.isArray(obj)) {
                if(typeof spec._entry !== "undefined") {
                    for(var i = 0; i < obj.length; i++) {
                        sub = validator.findMissingObjects(obj[i], spec._entry);
                        if(!_.isEmpty(sub)) {
                            res[i] = sub;
                        }
                    }
                }
            } else if(spec._type === "object") {
                for(var key in spec) {
                    if(spec.hasOwnProperty(key)) {
                        if (key[0] === "_") {
                            continue;
                        }
                        if (typeof obj[key] !== "undefined") {
                            sub = validator.findMissingObjects(obj[key], spec[key]);
                            if (!_.isEmpty(sub)) {
                                res[key] = sub;
                            }
                        } else {
                            if (typeof spec[key]._required !== "undefined" && spec[key]._required) {
                                res[key] = {_isMissing: true};
                                if (typeof spec[key]._doc !== "undefined") {
                                    res[key]._doc = spec[key]._doc;
                                }
                            }
                        }
                    }
                }
            }

            return res;
        } catch(e) {
        }
    },
    isProductsMissingInCategoryPage: function (digitalData) {
        try {
            if(!digitalData || !digitalData.page || !digitalData.page.category || !digitalData.page.category.pageType || !digitalData.product || typeof digitalData.product.length === "undefined") {
                return false;
            }

            var pageType = String(digitalData.page.category.pageType);
            var productCount = digitalData.product.length;

            return (pageType === "category" && productCount === 0);
        } catch(e) {
        }
    },
    isProductsMissingInCart: function (digitalData) {
        try {
            if(!digitalData || !digitalData.cart || !digitalData.cart.price || (!digitalData.cart.price.basePrice && !digitalData.cart.price.cartTotal && !digitalData.cart.price.priceWithTax)) {
                // No price totals exist, so cart items don't need to exist
                return false;
            }

            return !(digitalData.cart.items && digitalData.cart.items.length);
        } catch(e) {
        }
    },
    run: function (digitalData) {
        if(!specType || !specTypeProduct) {
            console.log("Warning: Cannot validate Digital Data Layer because specification was not loaded.");
            return;
        }

        var results = {};
        results.hasEmptyObjects = validator.hasEmptyObjects(digitalData);
        results.emptyObjects = validator.findEmptyObjects(digitalData);
        results.types = validator.checkTypes(digitalData, specType);
        results.missingObjects = validator.findMissingObjects(digitalData, specType);
        results.isProductsMissingInCategoryPage = validator.isProductsMissingInCategoryPage(digitalData);
        results.isProductsMissingInCart = validator.isProductsMissingInCart(digitalData);

        // Merge all validation checks together -- not really needed
        //var result = {};
        //_.extend(result, results.emptyObjects, results.types, results.missingObjects);
        //result = JSON.parse(JSON.stringify(result));// Can be used if deep copy really is needed

        return results;
    }
};

module.exports = { run: function (digitalData) {
    return validator.run(digitalData);
}};
