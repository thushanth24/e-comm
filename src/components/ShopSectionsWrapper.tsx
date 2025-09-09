'use client';

import React from 'react';
import ShopForWomen from './ui/ShopForWomen';
import ShopForMen from './ui/ShopForMen';
import ShopForKid from './ui/ShopForKid';

export default function ShopSectionsWrapper() {
  return (
    <React.Fragment>
      <ShopForWomen />
      <ShopForMen />
      <ShopForKid />
    </React.Fragment>
  );
}
