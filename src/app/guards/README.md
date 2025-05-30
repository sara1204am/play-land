# Basic Permissions Functionality Implementation

## Description
The platform permissions runs based on the user roles. The roles are defined in the backend and the frontend only checks if the user has the required role to access a specific model and the actions of that model.

For example, if the user has the role "admin" then the user can access all the models and actions, but if the user has the role "user" then the user can only access the models and actions that are defined for the role "user". For example:

| model | role  | action | enabled |
| ----- | ----- | ------ | ------- |
| user  | admin | create | true    |
| user  | admin | read   | true    |
| user  | admin | update | true    |
| user  | admin | delete | true    |
| user  | user  | create | false   |
| user  | user  | read   | true    |
| user  | user  | update | false   |
| user  | user  | delete | false   |

In this example, the user with the role "admin" can create, read, update and delete users, but the user with the role "user" can only read users.

The permissions use the [CASL](https://stalniy.github.io/casl/) library to check if the user has the required role to access a specific model and action.

## Usage

### Import the CASL module on your component

To use the CASL module, you need to import the module in your `COMPONENT.module.ts` file.


```typescript
...
import { AbilityModule } from '@casl/angular';
...

...
@NgModule({
  ...
  imports: [
    ...
    AbilityModule,
    ...
  ],
  ...
})
...
```

### Use the CASL pipe on your component template file (HTML)

The CASL pipe works with the following parameters:

- `model`: The model name, defined in the backend (e.g. user, office, user_configuration, etc).
- `action`: The action/operation name.

The pipe returns a boolean value, `true` if the user has the required role to access the model and action, `false` if the user doesn't have the required role to access the model and action.

So, you can use the pipe in the template file to show or hide elements based on the user role, for example:

#### Destroy or Show an element if the user doesn't have the required role

```html
<div *ngIf="'MODEL' | can: 'OPERATION'">...</div>
<div *ngIf="'user_configuration' | can: 'read'">...</div>
```

#### Make an element editable if the user has the required role

```html
<input [readonly]="!('MODEL' | can: 'OPERATION')">
<input [readonly]="!('user_configuration' | can: 'update')">
```

#### Disable a button if the user doesn't have the required role

```html
<button [disabled]="!('MODEL' | can: 'OPERATION')">...</button>
<button [disabled]="!('user_configuration' | can: 'update')">...</button>
```

#### Set the visibility of a html element based on the user role using the CSS `invisible` class (but still mantain its place in the DOM)

```html
<div [class.invisible]="!('MODEL' | can: 'OPERATION')">...</div>
<div [class.invisible]="!('user_configuration' | can: 'read')">...</div>
```

#### Set the visibility of a html element based on the user role using the CSS `hidden` class (and remove it from the DOM)

```html
<div [class.hidden]="!('MODEL' | can: 'OPERATION')">...</div>
<div [class.hidden]="!('user_configuration' | can: 'read')">...</div>
```

### Use the CASL pipe on your component class file (TS)

You can also use the CASL pipe on your component class file (TS) to check if the user has the required role to access a specific model and action.

AbilityService is a service that provides ability$ observable. This observable injects provided in DI PureAbility instance and emits it each time its rules are changed. This allows efficiently use permissions checks, especially in case we use ChangeDetectionStrategy.OnPush.

```typescript
@Component({
  selector: 'my-home',
  template: `
    @if(ability$ | async as ability){
      <h1>Home Page</h1>
      <button *ngIf="ability.can('create', 'Post')">Create Post</button>
    }
  `
})
export class HomeComponent {
  readonly ability$: Observable<AppAbility>;

  constructor(abilityService: AbilityService<AppAbility>) {
    this.ability$ = abilityService.ability$;
  }
}
```

Refer to the [CASL documentation](https://casl.js.org/v6/en/package/casl-angular#check-permissions-in-templates-using-ability-service) for more information.

### Considerations

There are 2 pipes in the CASL module: `able` or `ablePure`, the difference is that `able` uses the `ChangeDetectionStrategy.OnPush` strategy and `ablePure` uses the `ChangeDetectionStrategy.Default` strategy.

```html
<div *ngIf="'create' | ablePure: 'user_configuration' | async">...</div>
```

Both of the pipes work in the same way, but the `able` pipe is more efficient because it uses the `ChangeDetectionStrategy.OnPush` strategy, so it only checks the permissions when the input parameters change. The `ablePure` pipe uses the `ChangeDetectionStrategy.Default` strategy, so it checks the permissions every time the component is rendered.

If you are using the `ChangeDetectionStrategy.OnPush` strategy in your component, you should use the `able` pipe, but if you are using the `ChangeDetectionStrategy.Default` strategy in your component, you should use the `ablePure` pipe.

If you don't know what is the `ChangeDetectionStrategy` or you don't know what strategy are you using in your component, you should use the `able` pipe.

Refer to the [CASL documentation](https://casl.js.org/v6/en/package/casl-angular#performance-considerations) for more information.
