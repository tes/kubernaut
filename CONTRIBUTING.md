# Contributing

### Doing One Thing (Well)
An application should do one thing well. Kubernaut's "one thing" is to facilitate deployments of services to Kubernetes clusters. Likewise a class / module should only ever have one reason to change. Before creating a new class / module define its job in a single sentence, without conjunctions or cyclic references.

### Naming
Naming is hard. Please take time to think of appropriate names. Use nouns for modules / classes and verbs for functions. Avoid abbreviations (unless industry or defacto standard). Don't be afraid to use constants that aren't likely to change (e.g. 404)

### Get The Domain Model Right
The art of code is to maximise the work not done. When your domain model is wrong, you end up writing code to navigate and transform it. Get the domain model right and the code will look after itself.

### Very Small Functions
I try to keep the average size of a function to around 4. I'm not quite hitting that with Kubernaut yet. With async / try / catch it's likely to be a little bigger.

### Else Considered Harmful
I don't mind guard conditions (an if statement near the top of a function that returns immediately or throws an exception), but try very hard to avoid else or switch statements. They are typically hiding a fork in behaviour that is probably better handled with polymorphism. 

### Booleans Make Bad Parameters
Passing booleans as parameters leads to else statements. Else statements are bad. Use polymorphism instead.

### Avoid Inheritance
I prefer composition, mixins or duck typing to classic Java style inheritance hierarchies.

### Encapsulate, encapsulate, encapsulate
Did you know that the NASA Mars Climate Orbiter disintegrated because they didn't encapsulate quantities? The system on the ground sent thrust instructions in pound-seconds, but the flight system on the orbiter expected them in newton-seconds. When your software leaks primitives bad things happen. Please keep your behaviour and data as private as possible.

### No Comment
The only valid reason for comments is to explain why confusing code cannot be simplified - maybe you're working around a bug in a 3rd party library or implementing a naturally complicated algorithm (e.g. [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance). If you use comments to explain code for some other reason, then instead of writing the comment, take the time to simplify the code.

### Automated Tests
The code base is pretty well tested and will continue to be so.

### Syntax
Please adhere to the linting rules.
