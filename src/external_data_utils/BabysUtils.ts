import { BabysFactory } from './factories/BabysFactory';

export abstract class BabysUtils {
    private static babys = new BabysFactory();

    public static isBaby(pkmnName: string): boolean {
        return BabysUtils.babys.data.includes(pkmnName);
    }
}
