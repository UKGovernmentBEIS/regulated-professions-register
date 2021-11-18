# Database models

We use [TypeORM](https://github.com/typeorm/typeorm) to handle
communication with the database. By convention, we store the
models in the same folder as the module where the controller for
the module is located.

For example, if you have a module called `people` in a folder
called `people`, your model will be stored in a file called
`people.entity.ts`. A TypeORM model looks like this:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') // All of our models should have UUIDs as their primary keys
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;
}
```

And we can query/update the database like this:

```typescript
const user = new User();
user.firstName = 'Timber';
user.lastName = 'Saw';
user.age = 25;
await user.save();

const allUsers = await User.find();
const firstUser = await User.findOne(1);
const timber = await User.findOne({ firstName: 'Timber', lastName: 'Saw' });

await timber.remove();
```

For more information about models in TypeORM,
see the [TypeORM docs](https://github.com/typeorm/typeorm#readme)
