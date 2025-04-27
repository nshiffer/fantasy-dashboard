# Dynasty Fantasy Football Dashboard

A comprehensive dashboard for dynasty fantasy football leagues powered by the Sleeper API. This dashboard provides in-depth analytics, visualizations, and insights into your fantasy football league.

![Dynasty Fantasy Football Dashboard](public/dashboard-preview.png)

## Features

- **Standings Snapshot**: View current W-L-T records, PCT, PF (points for), PA (points against) with interactive sparklines showing weekly scoring trends
- **Schedule & Results**: See upcoming matchups for the next weeks and past week's scores with "upset alert" flags
- **Top Scorers**: Weekly and season-to-date leaderboards with "hot streak" badges for consistent performers
- **Power Rankings**: Custom algorithm combining record, recent SOS, and margin of victory
- **Roster Utilization Heatmap**: Visualize how effectively each team uses their roster spots
- **Draft Board**: Custom draft board with KeepTradeCut rankings integration, watchlist, and team needs analysis
- **Mobile-Friendly Design**: Full responsive design for all device sizes

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- A Sleeper fantasy football league

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/fantasy-dashboard.git
   cd fantasy-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using the Dashboard

1. Enter your Sleeper league ID (found in the URL of your Sleeper league page)
2. The dashboard will fetch all league data and display comprehensive analytics
3. Navigate between different sections using the navigation bar

## Deployment to GitHub Pages

The dashboard is designed to be easily deployed to GitHub Pages.

### Method 1: Using GitHub Actions (Recommended)

1. Push your changes to the main branch of your GitHub repository
2. Go to your repository's Settings > Pages
3. Set the source to "GitHub Actions"
4. The GitHub Actions workflow will automatically build and deploy your site
5. Your dashboard will be available at `https://your-username.github.io/fantasy-dashboard/`

### Method 2: Manual Deployment

To manually deploy the application to GitHub Pages:

```bash
# Build and deploy
npm run deploy
```

## Customization

You can customize various aspects of the dashboard:

- Update league ID and season in the `.env` file
- Modify the UI theme in `tailwind.config.js`
- Add additional data sources in the data fetching workflow

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Chart.js](https://www.chartjs.org/) - Interactive charts and visualizations
- [Sleeper API](https://docs.sleeper.com/) - Fantasy football data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Sleeper for providing a free and accessible API
- KeepTradeCut for player rankings data
- The fantasy football community for inspiration
