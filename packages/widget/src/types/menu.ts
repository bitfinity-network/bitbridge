import { TextProps } from "@chakra-ui/react";

export type DropDownItemProp = {
  id?: string;
  name: string;
  labelProps?: TextProps;
  img?: string;
  hideImage?: boolean;
  [key: string]: any;
};

export interface DropdownProps {
  value: DropDownItemProp;
  list?: DropDownItemProp[];
  hideImage?: boolean;
  labelProps?: TextProps;
  handleChange?: (item: DropDownItemProp) => void;
}
