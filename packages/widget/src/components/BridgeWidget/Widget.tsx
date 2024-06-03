import { Flex } from '@chakra-ui/react';

import { WidgetForm } from './WidgetForm';
import { WidgetWallets } from './WidgetWallets';

export function Widget() {
  return (
    <Flex justifyContent="center" alignItems="center" h="90vh">
      <WidgetForm />
      <WidgetWallets />
    </Flex>
  );
}
