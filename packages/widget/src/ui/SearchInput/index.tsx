import {
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps
} from '@chakra-ui/react';
import { IoSearch } from 'react-icons/io5';

const SearchInput = ({ ...rest }: InputProps) => {
  const py = [2, 2, 4];
  return (
    <InputGroup
      borderColor="secondary.alpha60"
      _placeholder={{
        color: 'secondary.alpha4',
        fontWeight: '600'
      }}
      _hover={{
        borderWidth: 0
      }}
      _focus={{
        boxShadow: 'none',
        borderWidth: 0,
        borderColor: 'secondary.alpha4'
      }}
      _active={{ borderColor: 'secondary.alpha4' }}
    >
      <InputLeftElement pointerEvents="none" py={py}>
        <Icon h="16px" w="16px" color="misc.icon.main" as={IoSearch} />
      </InputLeftElement>
      <Input py={py} fontSize="16px" {...rest} />
    </InputGroup>
  );
};
export { SearchInput };
