/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import { CoreStart } from 'src/core/public';
import { ActionByType } from '../../../../../../src/plugins/ui_actions/public';
import { toMountPoint } from '../../../../../../src/plugins/kibana_react/public';
import { IEmbeddable } from '../../../../../../src/plugins/embeddable/public';
import { FlyoutDrilldownWizard } from '../../components/flyout_drilldown_wizard';
import { ActionFactory } from '../../../../advanced_ui_actions/public';

export const OPEN_FLYOUT_ADD_DRILLDOWN = 'OPEN_FLYOUT_ADD_DRILLDOWN';

export interface FlyoutCreateDrilldownActionContext {
  embeddable: IEmbeddable;
}

export interface OpenFlyoutAddDrilldownParams {
  overlays: () => Promise<CoreStart['overlays']>;
  getDrilldownActionFactories: () => Array<ActionFactory<any>>;
}

export class FlyoutCreateDrilldownAction implements ActionByType<typeof OPEN_FLYOUT_ADD_DRILLDOWN> {
  public readonly type = OPEN_FLYOUT_ADD_DRILLDOWN;
  public readonly id = OPEN_FLYOUT_ADD_DRILLDOWN;
  public order = 2;

  constructor(protected readonly params: OpenFlyoutAddDrilldownParams) {}

  public getDisplayName() {
    return i18n.translate('xpack.drilldowns.FlyoutCreateDrilldownAction.displayName', {
      defaultMessage: 'Create drilldown',
    });
  }

  public getIconType() {
    return 'plusInCircle';
  }

  public async isCompatible({ embeddable }: FlyoutCreateDrilldownActionContext) {
    return embeddable.getInput().viewMode === 'edit';
  }

  public async execute(context: FlyoutCreateDrilldownActionContext) {
    const overlays = await this.params.overlays();

    const drilldownActionFactories = this.params.getDrilldownActionFactories();
    const compatibleDrilldownActionFactories = await Promise.all(
      drilldownActionFactories.map(factory => factory.isCompatible(context))
    ).then(compatibilityList =>
      drilldownActionFactories.filter((factory, index) => compatibilityList[index])
    );

    const handle = overlays.openFlyout(
      toMountPoint(
        <FlyoutDrilldownWizard
          onClose={() => handle.close()}
          drilldownActionFactories={compatibleDrilldownActionFactories}
        />
      )
    );
  }
}
