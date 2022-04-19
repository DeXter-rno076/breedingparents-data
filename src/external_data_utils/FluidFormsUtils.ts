import { InvalidArgumentException } from '../exceptions/InvalidArgumentException';
import { FluidFormsFactory } from './factories/FluidFormsFactory';

export abstract class FluidFormsUtils {
    private static fluidforms = new FluidFormsFactory();

    public static isFluidform(pkmnName: string): boolean {
        return this.fluidforms.data.has(pkmnName);
    }

    public static getNormalformFromFluidForm(pkmnName: string): string {
        if (!this.fluidforms.data.has(pkmnName)) {
            throw new InvalidArgumentException('pkmnName', 'expected name of fluid form');
        }
        return this.fluidforms.data.get(pkmnName);
    }
}
