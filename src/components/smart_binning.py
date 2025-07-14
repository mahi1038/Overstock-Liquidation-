import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
import hdbscan
import matplotlib.pyplot as plt


def run_smart_binning(final_df: pd.DataFrame,
                      min_size_range: tuple=(20, 150),
                      step: int=10,
                      visualize: bool=False) -> (pd.DataFrame, hdbscan.HDBSCAN):
    """
    Performs HDBSCAN-based smart binning, automatically selecting the
    optimal min_cluster_size by maximizing mean cluster persistence.
    Optionally visualizes the resulting clusters in 2D.

    Args:
        final_df: DataFrame containing features including ['sell_price',
                  'rolling_mean_28', 'price_pct_change', 'store_id', 'state_id'].
        min_size_range: Tuple (start, end) for min_cluster_size search.
        step: Step size for search.
        visualize: If True, plots a PCA scatter of clusters.

    Returns:
        final_df with a new 'bin' column, and the fitted HDBSCAN clusterer.
    """
    # Encode categorical features
    le_store = LabelEncoder()
    le_state = LabelEncoder()
    final_df['store_encoded'] = le_store.fit_transform(final_df['store_id'])
    final_df['state_encoded'] = le_state.fit_transform(final_df['state_id'])

    # Prepare features and scale
    features = final_df[[
        'sell_price', 'rolling_mean_28', 'price_pct_change',
        'store_encoded', 'state_encoded'
    ]].fillna(0)
    scaler = StandardScaler()
    X = scaler.fit_transform(features)

    # Tune min_cluster_size by persistence
    best_persistence = 0
    best_size = min_size_range[0]
    for size in range(min_size_range[0], min_size_range[1], step):
        clusterer = hdbscan.HDBSCAN(min_cluster_size=size)
        clusterer.fit(X)
        persistence = clusterer.cluster_persistence_
        avg_persistence = np.mean(persistence) if len(persistence) > 0 else 0
        if avg_persistence > best_persistence:
            best_persistence = avg_persistence
            best_size = size

    # Final clustering
    clusterer = hdbscan.HDBSCAN(min_cluster_size=best_size, prediction_data=True)
    final_df['bin'] = clusterer.fit_predict(X)

    # Optional visualization
    if visualize:
        pca = PCA(n_components=2)
        coords = pca.fit_transform(X)
        plt.figure(figsize=(8, 5))
        plt.scatter(coords[:, 0], coords[:, 1], c=final_df['bin'], cmap='tab20', s=5)
        plt.title(f"HDBSCAN bins (min_cluster_size={best_size})")
        plt.xlabel('PCA1')
        plt.ylabel('PCA2')
        plt.show()

    return final_df, clusterer


def score_bins(final_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregates and scores bins for clearance priority.

    Args:
        final_df: DataFrame after smart binning with 'bin' column.
    Returns:
        DataFrame with one row per bin and columns:
        ['bin','avg_price','avg_sales','price_elasticity','num_items','priority_score']
    """
    df = final_df[final_df['bin'] != -1]
    summary = df.groupby('bin').agg(
        avg_price=('sell_price', 'mean'),
        avg_sales=('rolling_mean_28', 'mean'),
        price_elasticity=('price_pct_change', 'mean'),
        num_items=('item_id', 'count')
    ).reset_index()

    # Compute priority: higher for low sales, high elasticity, few items
    summary['priority_score'] = (
        (1 / (summary['avg_sales'] + 1)) * 0.5 +
        summary['price_elasticity'].abs() * 0.3 +
        (1 / (summary['num_items'] + 1)) * 0.2
    )
    return summary.sort_values('priority_score', ascending=False)


def simulate_clearance(final_df: pd.DataFrame,
                       bin_scores: pd.DataFrame,
                       discount_levels: list=[0.1, 0.2, 0.3, 0.5]) -> pd.DataFrame:
    """
    Simulates clearance revenue for each bin at given discount levels.

    Returns a DataFrame with columns ['bin','discount','simulated_revenue'].
    """
    results = []
    for discount in discount_levels:
        for bin_id in bin_scores['bin']:
            bin_data = final_df[final_df['bin'] == bin_id].copy()
            bin_data['rolling_mean_28'] = bin_data['rolling_mean_28'].fillna(0)
            bin_data['sell_price'] = bin_data['sell_price'].fillna(0)
            elasticity = bin_data['price_pct_change'].fillna(0).mean()
            simulated_sales = bin_data['rolling_mean_28'] * (1 + elasticity * discount * 10)
            simulated_sales = simulated_sales.clip(lower=0)
            discounted_price = bin_data['sell_price'] * (1 - discount)
            revenue = (discounted_price * simulated_sales).sum()
            results.append({
                'bin': bin_id,
                'discount': discount,
                'simulated_revenue': round(revenue, 2)
            })
    return pd.DataFrame(results)


def suggest_clearance_strategy(bin_summary_df: pd.DataFrame) -> pd.DataFrame:
    """
    Assigns a human-readable clearance strategy to each bin.

    Args:
        bin_summary_df: DataFrame with ['bin','avg_price','avg_sales','price_elasticity','num_items']
    """
    strategies = []
    for _, row in bin_summary_df.iterrows():
        price, sales, elasticity = row['avg_price'], row['avg_sales'], row['price_elasticity']
        if sales == 0:
            strat = "50% discount, push locally"
        elif elasticity > 0.5:
            strat = "20% discount, online only"
        elif price < 100 and sales < 5:
            strat = "30% discount, combo offers"
        elif price >= 100 and sales >= 5:
            strat = "10% discount, push to app users"
        else:
            strat = "25% discount, experiment with flash sales"
        strategies.append(strat)
    bin_summary_df['clearance_strategy'] = strategies
    return bin_summary_df
