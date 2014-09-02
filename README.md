# Digital Data Validator

## Description

This script validates the Digital Data Layer of web pages against the specification.
The Digital Data Layer (DDL) is a standardised way of exposing data on your eCommerce site. If you implement to the
specification, it will mean that you will not have to duplicate your work to expose data to multiple providers (e.g.
Triggered Messaging, an analytics provider and a tag management provider).


## Instructions

Type these commands into a terminal to quickly install the validator:

1. Clone repo: `git clone git@github.com:TriggeredMessaging/digitalDataValidator.git`
2. Install Node.js modules: `npm install`
3. Run unit tests, making sure they all pass: `npm test`


The Digital Data Layer is stored in an object named `digitalData`. To validate a `digitalData` object, pass it into the
method `validator.run()`. This will return the validation results.

```
validator.run(digitalData);
```


## Outline of returned object

The returned object is a dictionary containing 6 keys. 3 of them are booleans and the other 3 are objects that follow
the structure of the inputted digitalData object. Since the latter three objects follow a similar structure they can
safely be merged if desired.

```
var result = {
    "isProductsMissingInCategoryPage": Boolean(),
    "isProductsMissingInCart": Boolean(),
    "hasEmptyObjects": Boolean(),
    "emptyObjects": Object(),
    "types": Object(),
    "missingObjects": Object()
};
```

### `result.isProductsMissingInCategoryPage`

Boolean. Expected to be `false`.

If the page is a 'category' page, then it is expected to contain a list of products. If no products exist then this
object is set to boolean true.

### `isProductsMissingInCart`

Boolean. Expected to be `false`.

If the cart total price is non-zero, then it is expected for there to be products in the cart. If no products exist then
this object is set to boolean true.

### `hasEmptyObjects`

Boolean. Expected to be `false`.

Whether any empty objects exist in the digitalData object.

### `emptyObjects`

Nested objects, following the structure of the digitalData object. Highlights empty keys.

If an object is empty, its key contains:
```{
    "_isEmpty": true
}
```

If an object is not empty, it is omitted here.

### `types`

Nested objects, following the structure of the digitalData object. Shows whether each key passed or failed the type
checks.

Here is an example of a passed type check where the key is an object.
```{
    "_typeExpected": "object",
    "_typeFound": "object",
    "_typeCheck": "passed",
}
```

Here is an example of a failed type check. The key is expected to be a string but instead is a number. Its key contains:
```{
    "_typeExpected": "string",
    "_typeFound": "number",
    "_typeCheck": "failed",
}
```

### `missingObjects`

Nested objects, following the structure of the digitalData object. Some objects are required to exist in the digitalData
layer. If these are missing, then their absence is flagged here.

If a required object is missing, its key contains:
```{
    "_isMissing": true
}
```

If a required object exists, nothing for it shows up here.


## Specification

The script validates against the specification found in the files spec/specType.json and spec/specTypeProduct.json .
The latter is an object type that is referenced in the former and is recursive. To change the specification, modify the
JSON objects in these files.


## Authors
Muhammed Onu Miah,
David Henderson


## License
Copyright 2014 Triggered Messaging

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.



