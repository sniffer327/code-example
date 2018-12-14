import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Modules
import { UiModule } from '../ui/ui.module';
import { MainRoutingModule } from './main.routing';

// Components
import { ModalTemplateComponent } from 'app/shared/components';
import * as layoutComponents from './components';
import { MainComponent } from './main.component';
import { RealtorAcceptComponent } from './realtors/components/modals';
import { RefDeleteAcceptComponent, RefEditAcceptComponent } from './refs/components';

// Services
import * as mainServices from './services';

// Modules
import { SharedModule } from 'app/shared/shared.module';

// Основной модуль приложения
@NgModule({
	imports: [
		CommonModule,
		MainRoutingModule,
		SharedModule,
		UiModule
	],
	declarations: [
		MainComponent,
		ModalTemplateComponent,

		// Layout component
		layoutComponents.HeaderComponent,
		layoutComponents.ContainerComponent,
		layoutComponents.ContentComponent,
		layoutComponents.SidebarMenuComponent,
		layoutComponents.CurrentUserComponent,
		layoutComponents.NotificationComponent,

		// Modal windows
		RealtorAcceptComponent,
		RefEditAcceptComponent,
		RefDeleteAcceptComponent
	],
	entryComponents: [
		RealtorAcceptComponent,
		RefEditAcceptComponent,
		RefDeleteAcceptComponent
	],
	providers: [
		// Services
		mainServices.NotificationService
	]
})
export class MainModule {}
