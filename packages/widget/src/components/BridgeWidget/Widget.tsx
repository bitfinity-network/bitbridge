import { Flex } from '@chakra-ui/react';

import { WidgetForm } from './WidgetForm';
import { WidgetWallets } from './WidgetWallets';
import { WidgetNetworks } from './WidgetNetworks';

export function Widget() {
  return (
    <Flex justifyContent="center" alignItems="center" h="90vh">
      <WidgetForm />
      <WidgetWallets />
      <WidgetNetworks />
    </Flex>
  );
}
