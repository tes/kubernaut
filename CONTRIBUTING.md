# Contributing

### Doing One Thing (Well)
An application should do one thing well. Kubernaut's "one thing" is to facilitate deployments of services to Kubernetes clusters. Likewise a class / module should only ever have one reason to change. Before creating a new class / module define its job in a single sentence, without conjunctions, e.g. using the word "and" or cyclic references, e.g. "The job of a service locator is to locate services".

### Naming
Naming is hard. Please take time to think of appropriate names. Use nouns for modules / classes and verbs for functions. Be suspicious of nouns ending in 'er' or 'or'. Manager, Locator, Helper, Wrapper usually operater on another entity's data. E.g. instead of `HttpHelper.get`, use `HttpClient.get`. Instead of `ServiceLocator.locate`, maybe `Services.locate`. Avoid abbreviations (unless industry, defacto or company standard). Don't be afraid to use constants that aren't likely to change (e.g. 404)

### Get The Domain Model Right
The art of code is to maximise the work not done. When your domain model is wrong, you end up writing code to navigate and transform it. Get the domain model right and the code will look after itself. Helpers, Utils and Constants modules are another anti-pattern. Anytime you bundle functions into a helper or util module you should think harder about where they truly belong (althought this is hard when the obvious choice, e.g. 'Date' and 'String' are already taken by the language). Another anti-pattern to watch out for are modules operating on another modules data. Instead of `kubernetes.deploy(release, 'staging')`, maybe `release.deploy('staging')` and inject the kubernetes client into the release? This encourages encapsulation and keeps argument lists small. Damn, now I need to go and refactor!

### Very Small Functions Operating At A Single Level Of Abstraction
I try to keep the average size of a function to around 4. I'm not quite hitting that with Kubernaut yet. With async / try / catch it's likely to be a little bigger. Functions shouldn't jump between operating on data and calling other functions. I also try to keep the number of function parameters down to around 2 or 3. Any more is an indicator that the domain model is wrong.

### Else Considered Harmful
I don't mind guard conditions (an if statement near the top of a function that returns immediately or throws an exception), but try very hard to avoid else or switch statements. They are typically hiding a fork in behaviour that is probably better handled with polymorphism. 
The best way to avoid else and switch statements is to dictate the code path at the earliest opportunity. This could be when a user performs an action (e.g. clicking a button), or by the routes you expose on your API.

When consuming another application's you may be forced into conditional logic. In such cases create a module who's sole job is to interpret the external input and route to appropriate handlers. In this way the complexity will be isolated and the remainder of your application can be kept simple.

### Booleans Make Bad Parameters
Passing booleans as parameters leads to else statements. Else statements are bad. Use polymorphism instead.

### Avoid Inheritance
I prefer composition, mixins or duck typing to classic Java style inheritance hierarchies.

### Encapsulate, encapsulate, encapsulate
Did you know that the NASA Mars Climate Orbiter disintegrated because they didn't encapsulate quantities? The system on the ground sent thrust instructions in pound-seconds, but the flight system on the orbiter expected them in newton-seconds. When your software leaks primitives bad things happen. Please keep your behaviour and data as private as possible.

### No Comment
The only valid reason for comments is to explain why confusing code cannot be simplified - maybe you're working around a bug in a 3rd party library or implementing a naturally complicated algorithm (e.g. [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance). If you use comments to explain code for some other reason, then instead of writing the comment, take the time to simplify the code.

### Automated Tests
The code base is well tested and will continue to be so. I try to vaoid mockings because tests which use mocking assert interactions rather than side effects. Interactions change even when the side effects stay the same, so this approach to testing is more brittle. The tests express implementation, rather than intent. 

### Syntax
Please adhere to the linting rules.
