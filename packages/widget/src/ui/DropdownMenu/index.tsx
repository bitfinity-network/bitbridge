import { Fragment, useCallback } from 'react';
import {
  Box,
  BoxProps,
  Collapse,
  Flex,
  HStack,
  Icon,
  TextProps,
  useDisclosure
} from '@chakra-ui/react';
import { BsCheckLg } from 'react-icons/bs';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { SelectedItem } from './SelectedItem';

export type DropDownItemProp = {
  id?: string;
  name: string;
  labelProps?: TextProps;
  img?: string;
  hideImage?: boolean;
};

export interface DropdownProps {
  value: DropDownItemProp;
  list?: DropDownItemProp[];
  hideImage?: boolean;
  labelProps?: TextProps;
  handleChange?: (item: DropDownItemProp) => void;
}

export function DropdownMenu({
  value,
  list = [],
  handleChange,
  hideImage,
  labelProps,
  ...boxProps
}: DropdownProps & BoxProps) {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const onItemSelect = useCallback(
    (e: DropDownItemProp) => {
      if (handleChange) {
        handleChange(e);
      }
      onClose();
    },
    [handleChange, onClose]
  );

  return (
    <Fragment>
      <Box bg="secondary.alpha8" w="full" {...boxProps}>
        <Flex
          alignItems="center"
          onClick={isOpen ? onClose : onOpen}
          aria-expanded={isOpen}
        >
          <SelectedItem
            name={value.name}
            img={value.img}
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
          {list.map(
            ({
              id,
              name,
              img,
              hideImage: itemHideImage,
              labelProps: itemLabelProps
            }) => {
              const isSelected = value && value.name === name;
              return (
                <Box
                  bg={isSelected ? 'primary.alpha8' : 'none'}
                  key={id || name}
                  onClick={() =>
                    onItemSelect({
                      id,
                      name,
                      img,
                      hideImage: itemHideImage,
                      labelProps: itemLabelProps
                    })
                  }
                  role="option"
                  aria-selected={isSelected}
                >
                  <HStack justifyContent="space-between" w="full">
                    <SelectedItem
                      bg="none"
                      name={name}
                      img={img}
                      hideImage={itemHideImage}
                      labelProps={itemLabelProps}
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
            }
          )}
        </Box>
      </Collapse>
    </Fragment>
  );
}
