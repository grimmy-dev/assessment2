import logging

import colorlog


def setup_logger(name: str, level: int = logging.DEBUG) -> logging.Logger:
    """
    Sets up a logger with colored output.

    Args:
        name (str): Name of the logger.
        level (int): Logging level.

    Returns:
        logging.Logger: Configured logger instance.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if logger.hasHandlers():
        return logger  # Avoid adding multiple handlers

    handler = logging.StreamHandler()
    formatter = colorlog.ColoredFormatter(
        fmt="%(log_color)s%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        log_colors={
            'DEBUG':    'bg_blue',
            'INFO':     'bold_green',
            'WARNING':  'bg_yellow',
            'ERROR':    'red',
            'CRITICAL': 'bg_red',
        }
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger