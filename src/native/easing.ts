import { cubicBezier } from "react-native-reanimated";
import { motion } from "../tokens/motion";

/** The token curves as reanimated CSS timing functions. */
export const EASE_OUT = cubicBezier(...motion.curve.out);
export const EASE_IN_OUT = cubicBezier(...motion.curve.inOut);
