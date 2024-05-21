import React, { Fragment } from "react";
import {
  Box,
  BoxProps,
  Collapse,
  Flex,
  HStack,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { BsCheckLg } from "react-icons/bs";
import { MdKeyboardArrowDown } from "react-icons/md";
import { SelectedItem } from "./SelectedItem";
import { DropDownItemProp, DropdownProps } from "../../types";

export function DropdownMenu({
  value,
  list = [],
  handleChange,
  hideImage,
  labelProps,
  ...boxProps
}: DropdownProps & BoxProps) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const onItemSelect = (e: DropDownItemProp) => {
    if (handleChange) {
      handleChange(e);
    }
    onClose();
  };
  return (
    <Fragment>
      <Box bg="secondary.alpha8" w="full" {...boxProps}>
        <Flex alignItems="center" onClick={isOpen ? onClose : onOpen}>
          <SelectedItem
            name={value.name}
            img={value?.logo}
            hideImage={hideImage}
            labelProps={labelProps}
          />
          <Icon
            as={MdKeyboardArrowDown}
            color="secondary.400"
            h="24px"
            w="24px"
            stroke="2px"
          />
        </Flex>
      </Box>
      <Collapse in={isOpen} animateOpacity>
        <Box>
          {list.map((item) => {
            const isSelected = value && value.name === item.name;
            return (
              <Box
                bg={isSelected ? "primary.alpha8" : "none"}
                key={item.name}
                onClick={() => onItemSelect(item)}
              >
                <HStack justifyContent="space-between" w="full">
                  <SelectedItem
                    bg="none"
                    name={item.name}
                    img={item.img}
                    hideImage={hideImage}
                    labelProps={labelProps}
                  />
                  {isSelected ? (
                    <Icon
                      as={BsCheckLg}
                      color="secondary.100"
                      h="24px"
                      w="24px"
                      stroke="2px"
                    />
                  ) : null}
                </HStack>
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Fragment>
  );
}
