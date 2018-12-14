import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { MainComponent } from './main.component';

const routes: Routes = [

	// Корневой маршрут
	{
		path: '',
		component: MainComponent,
		children: [
			{
				path: '',
				redirectTo: 'realtors',
				pathMatch: 'full'
			},

			// Модуль "Риэлторы"
			{
				path: 'realtors', loadChildren: 'app/main/realtors/realtors.module#RealtorsModule'
			},

			// Модуль "Объявления"
			{
				path: 'realty', loadChildren: 'app/main/realty/realty.module#RealtyModule'
			},

			// Модуль "Спраовчники"
			{
				path: 'refs', loadChildren: 'app/main/refs/refs.module#RefsModule'
			},

			// Модуль "Фильтры"
			{
				path: 'filters', loadChildren: 'app/main/filters/filters.module#FiltersModule'
			},

			// Модуль "Страницы"
			{
				path: 'pages', loadChildren: 'app/main/pages/pages.module#PagesModule'
			},

			// Некорректный маршрут
			{
				path: '**',
				redirectTo: 'realtors'
			}
		]
	}
];

// Модуль маршрутизации для основного модуля
@NgModule({
	imports: [ RouterModule.forChild(routes) ],
	exports: [ RouterModule ]
})
export class MainRoutingModule {}
