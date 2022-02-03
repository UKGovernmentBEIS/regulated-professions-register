expect.extend({
  toHaveJoined(queryBuilder: any, relations: Array<string>) {
    const calls = queryBuilder.leftJoinAndSelect.mock.calls;
    let table: string;

    const result = relations.filter((relation: string) => {
      table = relation.split('.')[1];

      return calls.some((i: string) => i[0] === relation && i[1] === table);
    });

    if (result.length == relations.length) {
      return {
        message: () =>
          `exepected queryBuilder to have received the relations \`${relations.join(
            ', ',
          )}\``,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `exepected queryBuilder to have received the relations \`${relations.join(
            ', ',
          )}\`, but got \`${calls.join(', ')}\``,
        pass: false,
      };
    }
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveJoined(tables: Array<string>): R;
    }
  }
}

export {};
