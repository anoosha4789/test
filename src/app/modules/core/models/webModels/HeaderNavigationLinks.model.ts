import { BhHeaderLinks } from 'bh-theme/lib/baker-header/baker-header.component';
import { NavItem } from 'bh-theme';

export interface HeaderNavigationLinks extends BhHeaderLinks {
  SideNavItems?: NavItem[];
  StepperNavItems?: any[];
}
