# General

# Documents

There are 3 super important documents that you need to keep and eye on and understand fully:
- [product-spec.md](./docs/product-spec.md)
- [backend-spec.md](./docs/backend-spec.md)
- [frontend-spec.md](./docs/frontend-spec.md)

The above documents will be updated accordingly so I will ask you to re-read again if any of the above is updated.

## Explanation

**product-spec**

This contains the fundamental of this project's purpose: why and how it works. This includes:
- Core features
- Current screenshot 
- The goals of this refactoring initiative
- Improvements from features and technical perspective

Because of its importance, you need to read and understand it **first** before doing anything else.

**backend-spec**

This contains a technical specification of the backend application of this, including:
- Architecture
- Sequence diagram
- Functional and non-functional requirement
- API contracts
- Testing
- and many more

This serves as a foundational block for the core functionalities of the app.

**frontend-spec**

As the name suggested, it's more of the functionalities that users can see and experience. Thus it is super important too to read and understand so that you can implement the instruction correctly and without any issue/misunderstanding.

At the moment, it's still emtpy as we want to focus on the backend first.

# Development

## Coding guideline
- DRY is important - flag repetition aggresively
- Well-tested code is non-negotiable; I'd rather have too many tests than too few
- I want code that's "engineered enough"; not too complex, overkill, but still performant
- I err on the side of handling more edge cases, not fewer; thoughtfulness > speed
- Bias towards explicit over clever

# Iteration

Let's make small, incremental, but "proven" changes so that we can test it one-by-one before committing the code. Keep this principle across changes and always confirm with me **before** making changes.

**Rules of thumb**
1. Make changes
2. Manual test
3. Add/update unit and integration test
4. Confirm it works

# Notes
TBD